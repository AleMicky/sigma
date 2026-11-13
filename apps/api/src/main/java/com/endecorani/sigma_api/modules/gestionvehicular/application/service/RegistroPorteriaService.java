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
        if (!vempleadoRepository.existsById(request.empleadoId())) {
            throw new ResourceNotFoundException("Empleado", request.empleadoId());
        }

        if (request.salidaVehicularId() != null
                && salidaVehicularRepository.findById(request.salidaVehicularId()).isEmpty()) {
            throw new ResourceNotFoundException("Salida Vehicular", request.salidaVehicularId());
        }

        List<RegistroPorteriaActivo> items = construirItemsSalida(request.activos());

        Instant fechaSalida = request.fechaHoraSalida() != null
                ? request.fechaHoraSalida()
                : Instant.now();

        String numero = correlativoService.generar(
                CorrelativoCodigo.REGISTRO_PORTERIA,
                LocalDate.now().getYear()
        );

        RegistroPorteria registro = RegistroPorteria.builder()
                .numero(numero)
                .empleadoId(request.empleadoId())
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
        List<RegistroPorteria> registros = repository.findAfuera();
        return toResponseList(registros);
    }

    @Transactional(readOnly = true)
    public PageResponse<RegistroPorteriaResponse> listar(
            String search,
            UUID empleadoId,
            UUID activoId,
            EstadoRegistroPorteria estado,
            Instant fechaDesde,
            Instant fechaHasta,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<RegistroPorteria> page = repository.findAll(
                search, empleadoId, activoId, estado, fechaDesde, fechaHasta, pageable
        );
        List<RegistroPorteriaResponse> content = toResponseList(page.getContent());
        return PageResponse.of(content, page);
    }

    @Transactional(readOnly = true)
    public RegistroPorteriaResponse obtenerPorId(UUID id) {
        RegistroPorteria registro = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de Portería", id));
        return toResponse(registro);
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

        return new RegistroPorteriaResponse(
                r.getId(),
                r.getNumero(),
                r.getEmpleadoId(),
                empleadosMap.get(r.getEmpleadoId()),
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

