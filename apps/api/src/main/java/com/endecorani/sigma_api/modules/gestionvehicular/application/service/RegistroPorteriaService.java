package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.AnularRegistroPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistrarLlegadaPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistrarSalidaPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistroPorteriaActivoLlegadaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistroPorteriaActivoSalidaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.RegistroPorteriaActivoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.RegistroPorteriaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.RegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.RegistroPorteriaActivo;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.RegistroPorteriaRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SalidaVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistroPorteriaService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "numero",
            "empleadoId",
            "fechaHoraSalida",
            "fechaHoraLlegada",
            "estado",
            "createdAt",
            "updatedAt"
    );

    private final RegistroPorteriaRepository repository;
    private final SalidaVehicularRepository salidaVehicularRepository;
    private final SpringActivoRepository activoRepository;
    private final SpringVEmpleadoRepository vempleadoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CorrelativoService correlativoService;
    private final SecurityUtils securityUtils;

    @Transactional
    public RegistroPorteriaResponse registrarSalida(RegistrarSalidaPorteriaRequest request) {
        boolean esExterno = Boolean.TRUE.equals(request.esExterno());
        String personaExterna = trimToNull(request.personaExterna());
        String placaExterna = trimToNull(request.placaExterna());

        if (esExterno) {
            if (personaExterna == null) {
                throw new BusinessException("El nombre de la persona externa es obligatorio.");
            }
            if (placaExterna == null) {
                throw new BusinessException("La placa del vehículo externo es obligatoria.");
            }
        } else {
            if (request.empleadoId() == null) {
                throw new BusinessException("El funcionario que sale es obligatorio.");
            }
            if (!vempleadoRepository.existsById(request.empleadoId())) {
                throw new ResourceNotFoundException("Empleado", request.empleadoId());
            }
        }

        if (request.salidaVehicularId() != null
                && salidaVehicularRepository.findById(request.salidaVehicularId()).isEmpty()) {
            throw new ResourceNotFoundException("Salida Vehicular", request.salidaVehicularId());
        }

        List<RegistroPorteriaActivo> items;
        if (esExterno) {
            if (request.activos() != null && !request.activos().isEmpty()) {
                items = construirItemsSalida(request.activos());
            } else {
                items = List.of(RegistroPorteriaActivo.builder()
                        .descripcionItem("Vehículo externo - Placa: " + placaExterna.toUpperCase())
                        .cantidad(1)
                        .observacionSalida(trimToNull(request.observacionSalida()))
                        .build());
            }
        } else {
            if (request.activos() == null || request.activos().isEmpty()) {
                throw new BusinessException("Debe registrar el vehículo o ítem que retira.");
            }
            items = construirItemsSalida(request.activos());
        }

        Instant fechaSalida = request.fechaHoraSalida() != null
                ? request.fechaHoraSalida()
                : Instant.now();

        String numero = correlativoService.generar(
                CorrelativoCodigo.REGISTRO_PORTERIA,
                LocalDate.now().getYear()
        );

        RegistroPorteria registro = RegistroPorteria.builder()
                .numero(numero)
                .esExterno(esExterno)
                .personaExterna(personaExterna)
                .placaExterna(placaExterna != null ? placaExterna.toUpperCase() : null)
                .empleadoId(esExterno ? null : request.empleadoId())
                .guardiaSalidaId(obtenerEmpleadoIdActual())
                .salidaVehicularId(request.salidaVehicularId())
                .fechaHoraSalida(fechaSalida)
                .estado(EstadoRegistroPorteria.AFUERA)
                .observacionSalida(trimToNull(request.observacionSalida()))
                .activos(items)
                .build();

        RegistroPorteria guardado = repository.save(registro);
        return toResponse(guardado);
    }

    @Transactional
    public RegistroPorteriaResponse registrarLlegada(UUID id, RegistrarLlegadaPorteriaRequest request) {
        RegistroPorteria registro = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de Portería", id));

        if (registro.getEstado() != EstadoRegistroPorteria.AFUERA) {
            throw new BusinessException(
                    "Solo se puede registrar la llegada de un registro en estado AFUERA. Estado actual: "
                            + registro.getEstado()
            );
        }

        Instant fechaLlegada = (request != null && request.fechaHoraLlegada() != null)
                ? request.fechaHoraLlegada()
                : Instant.now();

        if (fechaLlegada.isBefore(registro.getFechaHoraSalida())) {
            throw new BusinessException("La fecha/hora de llegada no puede ser anterior a la fecha/hora de salida.");
        }

        aplicarDetalleLlegada(registro, request);

        registro.setGuardiaLlegadaId(obtenerEmpleadoIdActual());
        registro.setFechaHoraLlegada(fechaLlegada);
        if (request != null) {
            registro.setObservacionLlegada(trimToNull(request.observacionLlegada()));
        }
        registro.setEstado(EstadoRegistroPorteria.COMPLETADO);

        RegistroPorteria guardado = repository.save(registro);
        return toResponse(guardado);
    }

    @Transactional
    public RegistroPorteriaResponse anular(UUID id, AnularRegistroPorteriaRequest request) {
        RegistroPorteria registro = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de Portería", id));

        if (registro.getEstado() != EstadoRegistroPorteria.AFUERA) {
            throw new BusinessException(
                    "Solo se puede anular un registro en estado AFUERA. Estado actual: " + registro.getEstado()
            );
        }

        registro.setEstado(EstadoRegistroPorteria.ANULADO);
        if (request != null && request.motivo() != null && !request.motivo().isBlank()) {
            registro.setObservacionLlegada(request.motivo().trim());
        }

        RegistroPorteria guardado = repository.save(registro);
        return toResponse(guardado);
    }

    @Transactional(readOnly = true)
    public List<RegistroPorteriaResponse> listarAfuera() {
        AlcanceArea alcance = resolverAlcance(null);
        if (alcance.sinAcceso()) {
            return List.of();
        }
        List<RegistroPorteria> registros = repository.findAfuera(alcance.areaId());
        return toResponseList(registros);
    }

    @Transactional(readOnly = true)
    public PageResponse<RegistroPorteriaResponse> listar(
            String search,
            UUID empleadoId,
            UUID activoId,
            UUID areaId,
            EstadoRegistroPorteria estado,
            Instant fechaDesde,
            Instant fechaHasta,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        AlcanceArea alcance = resolverAlcance(areaId);
        if (alcance.sinAcceso()) {
            return PageResponse.of(List.of(), new PageImpl<>(List.of(), pageable, 0));
        }

        Page<RegistroPorteria> page = repository.findAll(
                search, empleadoId, activoId, alcance.areaId(), estado, fechaDesde, fechaHasta, pageable
        );
        List<RegistroPorteriaResponse> content = toResponseList(page.getContent());
        return PageResponse.of(content, page);
    }

    @Transactional(readOnly = true)
    public RegistroPorteriaResponse obtenerPorId(UUID id) {
        RegistroPorteria registro = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de Portería", id));

        AlcanceArea alcance = resolverAlcance(null);
        if (alcance.sinAcceso() || !perteneceAlArea(registro, alcance.areaId())) {
            throw new ResourceNotFoundException("Registro de Portería", id);
        }
        return toResponse(registro);
    }

    /**
     * Determina el área (sección) a la que se restringe la consulta.
     * <ul>
     *     <li>Administrador: ve todo; opcionalmente puede filtrar por {@code areaSolicitada}.</li>
     *     <li>Otro rol: se fuerza el área del funcionario autenticado. Si el usuario no tiene
     *     un empleado/área asociado, no tiene acceso a ningún registro.</li>
     * </ul>
     */
    private AlcanceArea resolverAlcance(UUID areaSolicitada) {
        if (securityUtils.isAdmin()) {
            return new AlcanceArea(areaSolicitada, false);
        }
        UUID areaActual = obtenerAreaIdActual();
        return areaActual == null
                ? new AlcanceArea(null, true)
                : new AlcanceArea(areaActual, false);
    }

    private boolean perteneceAlArea(RegistroPorteria registro, UUID areaId) {
        if (areaId == null) {
            return true;
        }
        List<UUID> ids = new ArrayList<>(3);
        if (registro.getEmpleadoId() != null) ids.add(registro.getEmpleadoId());
        if (registro.getGuardiaSalidaId() != null) ids.add(registro.getGuardiaSalidaId());
        if (registro.getGuardiaLlegadaId() != null) ids.add(registro.getGuardiaLlegadaId());

        if (ids.isEmpty()) {
            return false;
        }
        return empleadoRepository.findAllById(ids).stream()
                .map(Empleado::getAreaId)
                .anyMatch(areaId::equals);
    }

    private UUID obtenerAreaIdActual() {
        try {
            return securityUtils.getCurrentUserId()
                    .flatMap(usuarioRepository::findById)
                    .map(Usuario::getPersonaId)
                    .flatMap(empleadoRepository::findFirstByPersonaId)
                    .map(Empleado::getAreaId)
                    .orElse(null);
        } catch (Exception ex) {
            return null;
        }
    }

    /**
     * @param areaId    área a filtrar ({@code null} = sin restricción).
     * @param sinAcceso {@code true} si el usuario no debe ver ningún registro.
     */
    private record AlcanceArea(UUID areaId, boolean sinAcceso) {
    }

    private List<RegistroPorteriaActivo> construirItemsSalida(List<RegistroPorteriaActivoSalidaRequest> requests) {
        Set<UUID> activoIds = requests.stream()
                .map(RegistroPorteriaActivoSalidaRequest::activoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (!activoIds.isEmpty()) {
            Set<UUID> existentes = activoRepository.findAllById(activoIds).stream()
                    .map(ActivoEntity::getId)
                    .collect(Collectors.toSet());
            for (UUID activoId : activoIds) {
                if (!existentes.contains(activoId)) {
                    throw new ResourceNotFoundException("Activo", activoId);
                }
            }
        }

        List<RegistroPorteriaActivo> items = new ArrayList<>();
        for (RegistroPorteriaActivoSalidaRequest itemReq : requests) {
            String descripcion = trimToNull(itemReq.descripcionItem());
            if (itemReq.activoId() == null && descripcion == null) {
                throw new BusinessException("Cada ítem debe especificar un activoId o una descripcionItem.");
            }
            items.add(RegistroPorteriaActivo.builder()
                    .activoId(itemReq.activoId())
                    .descripcionItem(descripcion)
                    .cantidad(itemReq.cantidad() != null ? itemReq.cantidad() : 1)
                    .observacionSalida(trimToNull(itemReq.observacionSalida()))
                    .build());
        }
        return items;
    }

    private void aplicarDetalleLlegada(RegistroPorteria registro, RegistrarLlegadaPorteriaRequest request) {
        if (request == null || request.activos() == null || request.activos().isEmpty()) {
            for (RegistroPorteriaActivo item : registro.getActivos()) {
                item.setRetornado(Boolean.TRUE);
            }
            return;
        }

        Map<UUID, RegistroPorteriaActivo> itemsPorId = registro.getActivos().stream()
                .collect(Collectors.toMap(RegistroPorteriaActivo::getId, Function.identity()));

        for (RegistroPorteriaActivoLlegadaRequest llegadaItem : request.activos()) {
            RegistroPorteriaActivo item = itemsPorId.get(llegadaItem.itemId());
            if (item == null) {
                throw new BusinessException(
                        "El ítem " + llegadaItem.itemId() + " no pertenece al registro de portería."
                );
            }
            item.setRetornado(llegadaItem.retornado());
            item.setObservacionLlegada(trimToNull(llegadaItem.observacionLlegada()));
        }

        for (RegistroPorteriaActivo item : registro.getActivos()) {
            if (item.getRetornado() == null) {
                item.setRetornado(Boolean.TRUE);
            }
        }
    }

    private RegistroPorteriaResponse toResponse(RegistroPorteria registro) {
        return toResponseList(List.of(registro)).get(0);
    }

    private List<RegistroPorteriaResponse> toResponseList(List<RegistroPorteria> registros) {
        if (registros.isEmpty()) {
            return List.of();
        }

        Set<UUID> empleadoIds = new HashSet<>();
        Set<UUID> activoIds = new HashSet<>();

        for (RegistroPorteria r : registros) {
            if (r.getEmpleadoId() != null) empleadoIds.add(r.getEmpleadoId());
            if (r.getGuardiaSalidaId() != null) empleadoIds.add(r.getGuardiaSalidaId());
            if (r.getGuardiaLlegadaId() != null) empleadoIds.add(r.getGuardiaLlegadaId());
            if (r.getActivos() != null) {
                for (RegistroPorteriaActivo a : r.getActivos()) {
                    if (a.getActivoId() != null) activoIds.add(a.getActivoId());
                }
            }
        }

        Map<UUID, String> empleadosMap = empleadoIds.isEmpty()
                ? Collections.emptyMap()
                : vempleadoRepository.findAllById(empleadoIds).stream()
                        .collect(Collectors.toMap(
                                VEmpleadoEntity::getEmpleadoId,
                                VEmpleadoEntity::getNombreCompleto,
                                (a, b) -> a
                        ));

        Map<UUID, ActivoEntity> activosMap = activoIds.isEmpty()
                ? Collections.emptyMap()
                : activoRepository.findAllById(activoIds).stream()
                        .collect(Collectors.toMap(
                                ActivoEntity::getId,
                                Function.identity(),
                                (a, b) -> a
                        ));

        return registros.stream()
                .map(r -> mapToResponse(r, empleadosMap, activosMap))
                .toList();
    }

    private RegistroPorteriaResponse mapToResponse(
            RegistroPorteria r,
            Map<UUID, String> empleadosMap,
            Map<UUID, ActivoEntity> activosMap
    ) {
        List<RegistroPorteriaActivoResponse> activosResp = r.getActivos() == null
                ? List.of()
                : r.getActivos().stream()
                        .map(a -> {
                            ActivoEntity activo = a.getActivoId() != null ? activosMap.get(a.getActivoId()) : null;
                            return new RegistroPorteriaActivoResponse(
                                    a.getId(),
                                    a.getActivoId(),
                                    activo != null ? activo.getCodigo() : null,
                                    activo != null ? activo.getNombre() : null,
                                    a.getDescripcionItem(),
                                    a.getCantidad(),
                                    a.getObservacionSalida(),
                                    a.getRetornado(),
                                    a.getObservacionLlegada()
                            );
                        })
                        .toList();

        String empleadoNombre = r.getEmpleadoId() != null
                ? empleadosMap.get(r.getEmpleadoId())
                : (Boolean.TRUE.equals(r.getEsExterno()) && r.getPersonaExterna() != null
                        ? r.getPersonaExterna()
                        : null);

        return new RegistroPorteriaResponse(
                r.getId(),
                r.getNumero(),
                r.getEsExterno(),
                r.getPersonaExterna(),
                r.getPlacaExterna(),
                r.getEmpleadoId(),
                empleadoNombre,
                r.getGuardiaSalidaId(),
                r.getGuardiaSalidaId() != null ? empleadosMap.get(r.getGuardiaSalidaId()) : null,
                r.getGuardiaLlegadaId(),
                r.getGuardiaLlegadaId() != null ? empleadosMap.get(r.getGuardiaLlegadaId()) : null,
                r.getSalidaVehicularId(),
                r.getFechaHoraSalida(),
                r.getFechaHoraLlegada(),
                r.getEstado(),
                r.getObservacionSalida(),
                r.getObservacionLlegada(),
                activosResp,
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }

    private UUID obtenerEmpleadoIdActual() {
        try {
            return securityUtils.getCurrentUserId()
                    .flatMap(usuarioRepository::findById)
                    .map(Usuario::getPersonaId)
                    .flatMap(empleadoRepository::findFirstByPersonaId)
                    .map(Empleado::getId)
                    .orElse(null);
        } catch (Exception ex) {
            return null;
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}

