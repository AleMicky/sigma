package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.EnviarSolicitudVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request.SolicitudVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularAdjuntoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularSolicitanteInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response.SolicitudVehicularTipoSolicitudInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.SolicitudVehicularMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.TipoSolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.TipoSolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
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
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SolicitudVehicularService {

    private static final String ESTADO_BORRADOR = "BORRADOR";
    private static final String ESTADO_SOLICITADO = "SOLICITADO";
    private static final String WORKFLOW_CODIGO = "SOLICITUD_VEHICULAR";

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
    private final SolicitudVehicularAdjuntoService adjuntoService;
    private final SolicitudVehicularMapper mapper;
    private final CorrelativoService correlativoService;
    private final WorkflowApplicationService workflowApplicationService;

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
        List<SolicitudVehicularAdjuntoResponse> adjuntos = adjuntoService.findBySolicitudVehicularId(id);
        return toResponse(solicitud, adjuntos);
    }

    @Transactional
    public SolicitudVehicularResponse create(SolicitudVehicularRequest dto) {
        String numero = StringUtils.normalize(dto.numero());
        if (numero == null || numero.isBlank()) {
            numero = correlativoService.generar(CorrelativoCodigo.SOLICITUD_VEHICULAR, LocalDateTime.now().getYear());
        } else {
            validarNumeroUnicoParaCrear(numero);
        }

        TipoSolicitudVehicular tipo = obtenerTipoSolicitud(dto.tipoSolicitudVehicularId());
        Empleado solicitante = obtenerEmpleado(dto.solicitanteId());

        String estado = StringUtils.normalize(dto.estado());
        if (estado == null || estado.isBlank()) {
            estado = ESTADO_BORRADOR;
        }

        SolicitudVehicular domain = mapper.toDomain(dto);
        domain.setNumero(numero);
        domain.setMotivo(StringUtils.normalize(dto.motivo()));
        domain.setJustificacion(StringUtils.normalize(dto.justificacion()));
        domain.setDestino(StringUtils.normalize(dto.destino()));
        domain.setObservacion(StringUtils.normalize(dto.observacion()));
        domain.setEstado(estado);

        SolicitudVehicular guardado = repository.save(domain);

        if (guardado.getId() != null) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("solicitudId", guardado.getId().toString());
            variables.put("solicitanteId", guardado.getSolicitanteId().toString());
            variables.put("destino", guardado.getDestino());
            variables.put("cantidadPasajeros", guardado.getCantidadPasajeros());

            try {
                String processInstanceId = workflowApplicationService.iniciar(
                        WORKFLOW_CODIGO,
                        guardado.getId().toString(),
                        variables
                );
                guardado.setProcessInstanceId(processInstanceId);
                guardado = repository.save(guardado);
            } catch (Exception ex) {
                // Si el workflow aún no está desplegado o en configuración, continuar guardando la solicitud
                if (dto.processInstanceId() != null && !dto.processInstanceId().isBlank()) {
                    guardado.setProcessInstanceId(StringUtils.normalize(dto.processInstanceId()));
                    guardado = repository.save(guardado);
                }
            }
        }

        return toResponse(guardado, tipo, solicitante, List.of());
    }

    @Transactional
    public SolicitudVehicularResponse createWithFiles(SolicitudVehicularRequest dto, List<MultipartFile> files) {
        SolicitudVehicularResponse response = create(dto);

        if (files != null && !files.isEmpty()) {
            adjuntoService.uploadMultipleFiles(response.id(), files);
            return findById(response.id());
        }

        return response;
    }

    @Transactional
    public SolicitudVehicularResponse enviar(UUID id, EnviarSolicitudVehicularRequest request) {
        SolicitudVehicular solicitud = obtenerPorId(id);

        if (!ESTADO_BORRADOR.equalsIgnoreCase(solicitud.getEstado())) {
            throw new ConflictException(
                    "SOLICITUD_ESTADO_INVALIDO",
                    "Solo se puede enviar una solicitud en estado BORRADOR"
            );
        }

        UUID aprobadorId = request.aprobadorId();
        if (aprobadorId == null) {
            throw new ConflictException(
                    "APROBADOR_REQUERIDO",
                    "Debe seleccionar un aprobador"
            );
        }

        Map<String, Object> variables = new HashMap<>();
        variables.put("solicitudId", solicitud.getId().toString());
        variables.put("solicitanteId", solicitud.getSolicitanteId().toString());
        variables.put("aprobadorId", aprobadorId.toString());
        if (request.comentario() != null && !request.comentario().isBlank()) {
            variables.put("comentario", request.comentario().trim());
        }

        if (solicitud.getProcessInstanceId() == null) {
            String processInstanceId = workflowApplicationService.iniciar(
                    WORKFLOW_CODIGO,
                    solicitud.getId().toString(),
                    variables
            );
            solicitud.setProcessInstanceId(processInstanceId);
        } else {
            CompleteWorkflowTaskRequest taskRequest = new CompleteWorkflowTaskRequest(variables);
            workflowApplicationService.completarTarea(
                    solicitud.getProcessInstanceId(),
                    taskRequest
            );
        }

        solicitud.setEstado(ESTADO_SOLICITADO);
        SolicitudVehicular actualizado = repository.save(solicitud);
        return findById(actualizado.getId());
    }

    @Transactional
    public SolicitudVehicularResponse completarWorkflow(UUID id, CompleteWorkflowTaskRequest request) {
        SolicitudVehicular solicitud = obtenerPorId(id);

        if (solicitud.getProcessInstanceId() == null) {
            throw new ConflictException(
                    "SOLICITUD_SIN_WORKFLOW",
                    "La solicitud no tiene workflow iniciado"
            );
        }

        Map<String, Object> effectiveVariables = new HashMap<>();
        if (request != null && request.variables() != null) {
            effectiveVariables.putAll(request.variables());
        }

        CompleteWorkflowTaskRequest effectiveRequest = new CompleteWorkflowTaskRequest(effectiveVariables);

        WorkflowTaskActionsResponse resultado = workflowApplicationService.completarTarea(
                solicitud.getProcessInstanceId(),
                effectiveRequest
        );

        String nuevoEstado = resultado.status() != null ? resultado.status().trim().toUpperCase() : null;
        if (nuevoEstado != null) {
            solicitud.setEstado(nuevoEstado);
        }

        SolicitudVehicular guardado = repository.save(solicitud);
        return findById(guardado.getId());
    }

    @Transactional
    public SolicitudVehicularResponse update(UUID id, SolicitudVehicularUpdate dto) {
        SolicitudVehicular actual = obtenerPorId(id);

        String estadoActual = actual.getEstado() != null ? actual.getEstado().toUpperCase() : "";
        if (!"BORRADOR".equals(estadoActual) && !"OBSERVADO".equals(estadoActual) && !"PENDIENTE".equals(estadoActual)) {
            throw new ConflictException(
                    "SOLICITUD_NO_EDITABLE",
                    "Solo se pueden editar solicitudes en estado BORRADOR u OBSERVADO"
            );
        }

        String numero = StringUtils.normalize(dto.numero());
        if (numero != null && !numero.isBlank()) {
            validarNumeroUnicoParaActualizar(numero, id);
            actual.setNumero(numero);
        }

        TipoSolicitudVehicular tipo = obtenerTipoSolicitud(dto.tipoSolicitudVehicularId());
        Empleado solicitante = obtenerEmpleado(dto.solicitanteId());

        mapper.updateDomain(dto, actual);
        actual.setMotivo(StringUtils.normalize(dto.motivo()));
        actual.setJustificacion(StringUtils.normalize(dto.justificacion()));
        actual.setDestino(StringUtils.normalize(dto.destino()));
        actual.setObservacion(StringUtils.normalize(dto.observacion()));
        if (dto.estado() != null && !dto.estado().isBlank()) {
            actual.setEstado(StringUtils.normalize(dto.estado()));
        }
        if (dto.processInstanceId() != null && !dto.processInstanceId().isBlank()) {
            actual.setProcessInstanceId(StringUtils.normalize(dto.processInstanceId()));
        }

        SolicitudVehicular actualizado = repository.save(actual);
        List<SolicitudVehicularAdjuntoResponse> adjuntos = adjuntoService.findBySolicitudVehicularId(id);
        return toResponse(actualizado, tipo, solicitante, adjuntos);
    }

    @Transactional
    public SolicitudVehicularResponse update(UUID id, SolicitudVehicularRequest dto) {
        SolicitudVehicular actual = obtenerPorId(id);

        String estadoActual = actual.getEstado() != null ? actual.getEstado().toUpperCase() : "";
        if (!"BORRADOR".equals(estadoActual) && !"OBSERVADO".equals(estadoActual) && !"PENDIENTE".equals(estadoActual)) {
            throw new ConflictException(
                    "SOLICITUD_NO_EDITABLE",
                    "Solo se pueden editar solicitudes en estado BORRADOR u OBSERVADO"
            );
        }

        String numero = StringUtils.normalize(dto.numero());
        if (numero != null && !numero.isBlank()) {
            validarNumeroUnicoParaActualizar(numero, id);
            actual.setNumero(numero);
        }

        TipoSolicitudVehicular tipo = obtenerTipoSolicitud(dto.tipoSolicitudVehicularId());
        Empleado solicitante = obtenerEmpleado(dto.solicitanteId());

        mapper.updateDomainFromRequest(dto, actual);
        actual.setMotivo(StringUtils.normalize(dto.motivo()));
        actual.setJustificacion(StringUtils.normalize(dto.justificacion()));
        actual.setDestino(StringUtils.normalize(dto.destino()));
        actual.setObservacion(StringUtils.normalize(dto.observacion()));
        if (dto.estado() != null && !dto.estado().isBlank()) {
            actual.setEstado(StringUtils.normalize(dto.estado()));
        }
        if (dto.processInstanceId() != null && !dto.processInstanceId().isBlank()) {
            actual.setProcessInstanceId(StringUtils.normalize(dto.processInstanceId()));
        }

        SolicitudVehicular actualizado = repository.save(actual);
        List<SolicitudVehicularAdjuntoResponse> adjuntos = adjuntoService.findBySolicitudVehicularId(id);
        return toResponse(actualizado, tipo, solicitante, adjuntos);
    }

    @Transactional
    public void delete(UUID id) {
        SolicitudVehicular actual = obtenerPorId(id);
        String estadoActual = actual.getEstado() != null ? actual.getEstado().toUpperCase() : "";
        if (!"BORRADOR".equals(estadoActual) && !"PENDIENTE".equals(estadoActual)) {
            throw new ConflictException(
                    "SOLICITUD_NO_ELIMINABLE",
                    "Solo se pueden eliminar solicitudes en estado BORRADOR"
            );
        }

        adjuntoService.deleteBySolicitudVehicularId(id);
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

        Map<UUID, SolicitudVehicularTipoSolicitudInfo> tipoMap = new HashMap<>();
        for (UUID tipoId : tipoIds) {
            tipoSolicitudVehicularRepository.findById(tipoId).ifPresent(t ->
                    tipoMap.put(tipoId, new SolicitudVehicularTipoSolicitudInfo(
                            t.getId(),
                            t.getCodigo(),
                            t.getNombre(),
                            t.getDiasAnticipacion(),
                            t.getRequiereRespaldo(),
                            t.getRequiereJustificacion()
                    ))
            );
        }

        Map<UUID, SolicitudVehicularSolicitanteInfo> solicitanteMap = solicitanteIds.isEmpty()
                ? Map.of()
                : springVEmpleadoRepository.findAllById(solicitanteIds).stream()
                .collect(Collectors.toMap(
                        VEmpleadoEntity::getEmpleadoId,
                        ve -> new SolicitudVehicularSolicitanteInfo(
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
                    SolicitudVehicularTipoSolicitudInfo tipoInfo =
                            domain.getTipoSolicitudVehicularId() != null ? tipoMap.get(domain.getTipoSolicitudVehicularId()) : null;
                    SolicitudVehicularSolicitanteInfo solicitanteInfo =
                            domain.getSolicitanteId() != null ? solicitanteMap.get(domain.getSolicitanteId()) : null;
                    return mapper.toResponse(domain, tipoInfo, solicitanteInfo, null);
                })
                .toList();

        return PageResponse.of(responses, page);
    }

    private SolicitudVehicularResponse toResponse(SolicitudVehicular domain, List<SolicitudVehicularAdjuntoResponse> adjuntos) {
        SolicitudVehicularTipoSolicitudInfo tipoInfo = domain.getTipoSolicitudVehicularId() != null
                ? obtenerTipoInfo(domain.getTipoSolicitudVehicularId())
                : null;
        SolicitudVehicularSolicitanteInfo solicitanteInfo = domain.getSolicitanteId() != null
                ? obtenerSolicitanteInfo(domain.getSolicitanteId())
                : null;
        return mapper.toResponse(domain, tipoInfo, solicitanteInfo, adjuntos);
    }

    private SolicitudVehicularResponse toResponse(
            SolicitudVehicular domain,
            TipoSolicitudVehicular tipo,
            Empleado solicitante,
            List<SolicitudVehicularAdjuntoResponse> adjuntos
    ) {
        SolicitudVehicularTipoSolicitudInfo tipoInfo = tipo != null
                ? mapper.toTipoInfo(tipo)
                : (domain.getTipoSolicitudVehicularId() != null ? obtenerTipoInfo(domain.getTipoSolicitudVehicularId()) : null);

        SolicitudVehicularSolicitanteInfo solicitanteInfo = domain.getSolicitanteId() != null
                ? obtenerSolicitanteInfo(domain.getSolicitanteId())
                : (solicitante != null ? mapper.toSolicitanteInfo(solicitante) : null);

        return mapper.toResponse(domain, tipoInfo, solicitanteInfo, adjuntos);
    }

    private SolicitudVehicularTipoSolicitudInfo obtenerTipoInfo(UUID tipoId) {
        return tipoSolicitudVehicularRepository.findById(tipoId)
                .map(mapper::toTipoInfo)
                .orElse(null);
    }

    private SolicitudVehicularSolicitanteInfo obtenerSolicitanteInfo(UUID solicitanteId) {
        if (solicitanteId == null) {
            return null;
        }
        return springVEmpleadoRepository.findById(solicitanteId)
                .map(ve -> new SolicitudVehicularSolicitanteInfo(
                        ve.getEmpleadoId(),
                        ve.getCodigo(),
                        ve.getNombreCompleto(),
                        ve.getCargo(),
                        ve.getArea()
                ))
                .orElseGet(() -> empleadoRepository.findById(solicitanteId)
                        .map(emp -> new SolicitudVehicularSolicitanteInfo(
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
