package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.SolicitudVehicularMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.TipoSolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.TipoSolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SolicitudVehicularService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "numero",
            "tipoSolicitudVehicularId",
            "solicitanteId",
            "motivo",
            "destino",
            "fechaSalida",
            "fechaRetornoEstimada",
            "cantidadPasajeros",
            "estado",
            "createdAt",
            "updatedAt"
    );

    private final SolicitudVehicularRepository repository;
    private final TipoSolicitudVehicularRepository tipoSolicitudVehicularRepository;
    private final EmpleadoRepository empleadoRepository;
    private final SpringVEmpleadoRepository springVEmpleadoRepository;
    private final SolicitudVehicularMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<SolicitudVehicularResponse> listar(String search, PageRequestDto pageRequest) {
        return listar(search, null, null, null, pageRequest);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudVehicularResponse> listar(
            String search,
            String estado,
            UUID tipoSolicitudVehicularId,
            UUID solicitanteId,
            PageRequestDto pageRequest
    ) {
        String normalizedSearch = StringUtils.normalize(search);
        String normalizedEstado = StringUtils.normalize(estado);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<SolicitudVehicular> resultado;

        if ((normalizedSearch == null || normalizedSearch.isBlank()) &&
                (normalizedEstado == null || normalizedEstado.isBlank()) &&
                tipoSolicitudVehicularId == null &&
                solicitanteId == null) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.searchWithFilters(
                    normalizedSearch,
                    normalizedEstado,
                    tipoSolicitudVehicularId,
                    solicitanteId,
                    pageable
            );
        }

        return toPageResponse(resultado);
    }

    @Transactional(readOnly = true)
    public SolicitudVehicularResponse findById(UUID id) {
        SolicitudVehicular solicitud = obtenerPorId(id);
        return toResponse(solicitud);
    }

    @Transactional
    public SolicitudVehicularResponse create(SolicitudVehicularRequest dto) {
        String numero = StringUtils.normalize(dto.numero());
        validarNumeroUnicoParaCrear(numero);

        TipoSolicitudVehicular tipo = obtenerTipoSolicitud(dto.tipoSolicitudVehicularId());
        Empleado solicitante = obtenerEmpleado(dto.solicitanteId());

        String estado = StringUtils.normalize(dto.estado());
        if (estado == null || estado.isBlank()) {
            estado = "PENDIENTE";
        }

        SolicitudVehicular domain = mapper.toDomain(dto);
        domain.setNumero(numero);
        domain.setMotivo(StringUtils.normalize(dto.motivo()));
        domain.setJustificacion(StringUtils.normalize(dto.justificacion()));
        domain.setDestino(StringUtils.normalize(dto.destino()));
        domain.setObservacion(StringUtils.normalize(dto.observacion()));
        domain.setEstado(estado);
        domain.setProcessInstanceId(StringUtils.normalize(dto.processInstanceId()));

        SolicitudVehicular guardado = repository.save(domain);
        return toResponse(guardado, tipo, solicitante);
    }

    @Transactional
    public SolicitudVehicularResponse update(UUID id, SolicitudVehicularUpdate dto) {
        SolicitudVehicular actual = obtenerPorId(id);

        String numero = StringUtils.normalize(dto.numero());
        validarNumeroUnicoParaActualizar(numero, id);

        TipoSolicitudVehicular tipo = obtenerTipoSolicitud(dto.tipoSolicitudVehicularId());
        Empleado solicitante = obtenerEmpleado(dto.solicitanteId());

        mapper.updateDomain(dto, actual);
        actual.setNumero(numero);
        actual.setMotivo(StringUtils.normalize(dto.motivo()));
        actual.setJustificacion(StringUtils.normalize(dto.justificacion()));
        actual.setDestino(StringUtils.normalize(dto.destino()));
        actual.setObservacion(StringUtils.normalize(dto.observacion()));
        if (dto.estado() != null && !dto.estado().isBlank()) {
            actual.setEstado(StringUtils.normalize(dto.estado()));
        }
        actual.setProcessInstanceId(StringUtils.normalize(dto.processInstanceId()));

        SolicitudVehicular actualizado = repository.save(actual);
        return toResponse(actualizado, tipo, solicitante);
    }

    @Transactional
    public SolicitudVehicularResponse update(UUID id, SolicitudVehicularRequest dto) {
        SolicitudVehicular actual = obtenerPorId(id);

        String numero = StringUtils.normalize(dto.numero());
        validarNumeroUnicoParaActualizar(numero, id);

        TipoSolicitudVehicular tipo = obtenerTipoSolicitud(dto.tipoSolicitudVehicularId());
        Empleado solicitante = obtenerEmpleado(dto.solicitanteId());

        mapper.updateDomainFromRequest(dto, actual);
        actual.setNumero(numero);
        actual.setMotivo(StringUtils.normalize(dto.motivo()));
        actual.setJustificacion(StringUtils.normalize(dto.justificacion()));
        actual.setDestino(StringUtils.normalize(dto.destino()));
        actual.setObservacion(StringUtils.normalize(dto.observacion()));
        if (dto.estado() != null && !dto.estado().isBlank()) {
            actual.setEstado(StringUtils.normalize(dto.estado()));
        }
        actual.setProcessInstanceId(StringUtils.normalize(dto.processInstanceId()));

        SolicitudVehicular actualizado = repository.save(actual);
        return toResponse(actualizado, tipo, solicitante);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private PageResponse<SolicitudVehicularResponse> toPageResponse(Page<SolicitudVehicular> page) {
        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }

        List<SolicitudVehicular> content = page.getContent();

        Set<UUID> tipoIds = content.stream()
                .map(SolicitudVehicular::getTipoSolicitudVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> solicitanteIds = content.stream()
                .map(SolicitudVehicular::getSolicitanteId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, SolicitudVehicularResponse.TipoSolicitudVehicularInfo> tipoMap = new HashMap<>();
        for (UUID tipoId : tipoIds) {
            tipoSolicitudVehicularRepository.findById(tipoId).ifPresent(t ->
                    tipoMap.put(tipoId, new SolicitudVehicularResponse.TipoSolicitudVehicularInfo(
                            t.getId(),
                            t.getCodigo(),
                            t.getNombre(),
                            t.getDiasAnticipacion(),
                            t.getRequiereRespaldo(),
                            t.getRequiereJustificacion()
                    ))
            );
        }

        Map<UUID, SolicitudVehicularResponse.SolicitanteInfo> solicitanteMap = solicitanteIds.isEmpty()
                ? Map.of()
                : springVEmpleadoRepository.findAllById(solicitanteIds).stream()
                .collect(Collectors.toMap(
                        VEmpleadoEntity::getEmpleadoId,
                        ve -> new SolicitudVehicularResponse.SolicitanteInfo(
                                ve.getEmpleadoId(),
                                ve.getCodigo(),
                                ve.getNombreCompleto(),
                                ve.getCargo(),
                                ve.getArea()
                        ),
                        (a, b) -> a
                ));

        List<SolicitudVehicularResponse> responses = content.stream()
                .map(domain -> {
                    SolicitudVehicularResponse.TipoSolicitudVehicularInfo tipoInfo =
                            domain.getTipoSolicitudVehicularId() != null ? tipoMap.get(domain.getTipoSolicitudVehicularId()) : null;
                    SolicitudVehicularResponse.SolicitanteInfo solicitanteInfo =
                            domain.getSolicitanteId() != null ? solicitanteMap.get(domain.getSolicitanteId()) : null;
                    return mapper.toResponse(domain, tipoInfo, solicitanteInfo);
                })
                .toList();

        return PageResponse.of(responses, page);
    }

    private SolicitudVehicularResponse toResponse(SolicitudVehicular domain) {
        SolicitudVehicularResponse.TipoSolicitudVehicularInfo tipoInfo = domain.getTipoSolicitudVehicularId() != null
                ? obtenerTipoInfo(domain.getTipoSolicitudVehicularId())
                : null;
        SolicitudVehicularResponse.SolicitanteInfo solicitanteInfo = domain.getSolicitanteId() != null
                ? obtenerSolicitanteInfo(domain.getSolicitanteId())
                : null;
        return mapper.toResponse(domain, tipoInfo, solicitanteInfo);
    }

    private SolicitudVehicularResponse toResponse(SolicitudVehicular domain, TipoSolicitudVehicular tipo, Empleado solicitante) {
        SolicitudVehicularResponse.TipoSolicitudVehicularInfo tipoInfo = tipo != null
                ? mapper.toTipoInfo(tipo)
                : (domain.getTipoSolicitudVehicularId() != null ? obtenerTipoInfo(domain.getTipoSolicitudVehicularId()) : null);

        SolicitudVehicularResponse.SolicitanteInfo solicitanteInfo = domain.getSolicitanteId() != null
                ? obtenerSolicitanteInfo(domain.getSolicitanteId())
                : (solicitante != null ? mapper.toSolicitanteInfo(solicitante) : null);

        return mapper.toResponse(domain, tipoInfo, solicitanteInfo);
    }

    private SolicitudVehicularResponse.TipoSolicitudVehicularInfo obtenerTipoInfo(UUID tipoId) {
        return tipoSolicitudVehicularRepository.findById(tipoId)
                .map(mapper::toTipoInfo)
                .orElse(null);
    }

    private SolicitudVehicularResponse.SolicitanteInfo obtenerSolicitanteInfo(UUID solicitanteId) {
        if (solicitanteId == null) {
            return null;
        }
        return springVEmpleadoRepository.findById(solicitanteId)
                .map(ve -> new SolicitudVehicularResponse.SolicitanteInfo(
                        ve.getEmpleadoId(),
                        ve.getCodigo(),
                        ve.getNombreCompleto(),
                        ve.getCargo(),
                        ve.getArea()
                ))
                .orElseGet(() -> empleadoRepository.findById(solicitanteId)
                        .map(emp -> new SolicitudVehicularResponse.SolicitanteInfo(
                                emp.getId(),
                                emp.getCodigo(),
                                emp.getNombreCompleto(),
                                emp.getCargo(),
                                emp.getArea()
                        ))
                        .orElse(null));
    }

    private SolicitudVehicular obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud vehicular", id));
    }

    private TipoSolicitudVehicular obtenerTipoSolicitud(UUID tipoId) {
        return tipoSolicitudVehicularRepository.findById(tipoId)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de solicitud vehicular", tipoId));
    }

    private Empleado obtenerEmpleado(UUID empleadoId) {
        return empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", empleadoId));
    }

    private void validarNumeroUnicoParaCrear(String numero) {
        if (numero != null && repository.existsByNumeroIgnoreCase(numero)) {
            throw new ConflictException(
                    "SOLICITUD_VEHICULAR_NUMERO_ALREADY_EXISTS",
                    "Ya existe una solicitud vehicular con el número '%s'".formatted(numero)
            );
        }
    }

    private void validarNumeroUnicoParaActualizar(String numero, UUID currentId) {
        if (numero != null && repository.existsByNumeroIgnoreCaseAndIdNot(numero, currentId)) {
            throw new ConflictException(
                    "SOLICITUD_VEHICULAR_NUMERO_ALREADY_EXISTS",
                    "Ya existe otra solicitud vehicular con el número '%s'".formatted(numero)
            );
        }
    }
}
