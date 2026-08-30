package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.EnviarSolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.SolicitudMantenimientoAdjuntoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PrioridadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoAdjuntoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.TipoMantenimientoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Persona;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class SolicitudMantenimientoService {

    private static final int TITULO_MIN_LENGTH = 1;
    private static final int TITULO_MAX_LENGTH = 150;
    private static final int DESCRIPCION_MAX_LENGTH = 2000;
    private static final String ESTADO_BORRADOR = "borrador";
    private static final String ESTADO_SOLICITADO = "solicitado";
    private static final String WORKFLOW_CODIGO = "SOLICITUD_MANTENIMIENTO";
    private static final String ADJUNTO_FOLDER = "solicitud_mantenimiento_adjuntos";

    private static final Set<String> SORT_FIELDS = Set.copyOf(Arrays.asList(
            "id", "numero", "activoId", "tipoMantenimientoId", "prioridadId",
            "solicitanteId", "estado", "fechaSolicitud", "fechaEstimadaOt", "createdAt", "updatedAt"));

    private final SolicitudMantenimientoRepository repository;
    private final ActivoRepository activoRepository;
    private final TipoMantenimientoRepository tipoMantenimientoRepository;
    private final PrioridadRepository prioridadRepository;
    private final EmpleadoRepository empleadoRepository;
    private final PersonaRepository personaRepository;
    private final SolicitudMantenimientoAdjuntoRepository adjuntoRepository;
    private final DocumentStorageService documentStorageService;
    private final CorrelativoService correlativoService;
    private final WorkflowApplicationService workflowApplicationService;

    @Transactional
    public SolicitudMantenimientoResponse create(SolicitudMantenimientoRequest request) {
        validateForeignEntities(request.activoId(), request.tipoMantenimientoId(), request.prioridadId());

        String numero = correlativoService.generar(CorrelativoCodigo.SOLICITUD_MANTENIMIENTO,
                LocalDateTime.now().getYear());

        SolicitudMantenimiento domain = SolicitudMantenimiento.builder()
                .numero(numero)
                .activoId(request.activoId())
                .tipoMantenimientoId(request.tipoMantenimientoId())
                .tipoFallas(request.tipoFallas())
                .prioridadId(request.prioridadId())
                .solicitanteId(request.solicitanteId())
                .titulo(requireNormalizedTitulo(request.titulo()))
                .descripcion(requireNormalizedDescripcion(request.descripcion()))
                .estado(ESTADO_BORRADOR)
                .fechaSolicitud(request.fechaSolicitud() != null ? request.fechaSolicitud() : LocalDateTime.now())
                .fechaEstimadaOt(request.fechaEstimadaOt())
                .build();

        SolicitudMantenimiento saved = repository.save(domain);

        // Iniciar workflow en estado BORRADOR
        Map<String, Object> variables = new HashMap<>();
        variables.put("solicitudId", saved.getId().toString());
        variables.put("solicitanteId", saved.getSolicitanteId().toString());

        String processInstanceId = workflowApplicationService.iniciar(
                WORKFLOW_CODIGO,
                saved.getId().toString(),
                variables);

        saved.setProcessInstanceId(processInstanceId);

        return toResponse(repository.save(saved));
    }

    @Transactional
    public SolicitudMantenimientoResponse createWithFiles(SolicitudMantenimientoRequest request,
            List<MultipartFile> files) {
        SolicitudMantenimientoResponse response = create(request);

        if (files == null || files.isEmpty()) {
            return response;
        }

        List<SolicitudMantenimientoAdjuntoResponse> adjuntos = files.stream()
                .map(file -> {
                    DocumentStorageService.StoredFile stored = documentStorageService.store(ADJUNTO_FOLDER,
                            UUID.randomUUID(), file);
                    SolicitudMantenimientoAdjunto adjunto = SolicitudMantenimientoAdjunto.builder()
                            .solicitudMantenimientoId(response.id())
                            .nombreArchivo(stored.nombreOriginal())
                            .tipoContenido(stored.mimeType())
                            .size(stored.tamanoBytes())
                            .url(stored.publicUrl())
                            .build();
                    return toAdjuntoResponse(adjuntoRepository.save(adjunto));
                })
                .toList();

        return toResponse(findDomainById(response.id()), adjuntos);
    }

    @Transactional
    public SolicitudMantenimientoResponse enviar(
            UUID id,
            EnviarSolicitudMantenimientoRequest request) {

        SolicitudMantenimiento solicitud = findDomainById(id);

        if (!ESTADO_BORRADOR.equalsIgnoreCase(
                solicitud.getEstado())) {
            throw new ConflictException(
                    "SOLICITUD_ESTADO_INVALIDO",
                    "Solo se puede enviar una solicitud en estado BORRADOR");
        }

        UUID aprobadorId = request.getEffectiveAprobadorId();
        if (aprobadorId == null) {
            throw new BusinessException(
                    "APROBADOR_REQUERIDO",
                    "Debe seleccionar un aprobador");
        }

        // 1. Guardar responsables designados
        solicitud.setAprobadoPorId(aprobadorId);

        if (request.supervisorId() != null) {
            solicitud.setSupervisorId(request.supervisorId());
        }

        // 2. Variables que necesita Flowable
        Map<String, Object> variables = new HashMap<>();
        variables.put("solicitudId", solicitud.getId().toString());
        variables.put("solicitanteId", solicitud.getSolicitanteId().toString());
        variables.put("aprobadorId", aprobadorId.toString());
        String supervisor = solicitud.getSupervisorId() != null
                ? solicitud.getSupervisorId().toString()
                : aprobadorId.toString();
        variables.put("supervisorId", supervisor);

        // 3. Avanzar o iniciar workflow
        if (solicitud.getProcessInstanceId() == null) {
            String processInstanceId = workflowApplicationService.iniciar(
                    WORKFLOW_CODIGO,
                    solicitud.getId().toString(),
                    variables);
            solicitud.setProcessInstanceId(processInstanceId);
        } else {
            CompleteWorkflowTaskRequest taskRequest = new CompleteWorkflowTaskRequest(variables);
            workflowApplicationService.completarTarea(
                    solicitud.getProcessInstanceId(),
                    taskRequest);
        }

        // 4. Guardar estado
        solicitud.setEstado(
                ESTADO_SOLICITADO);

        return toResponse(
                repository.save(solicitud));
    }

    @Transactional
    public SolicitudMantenimientoResponse update(UUID id, SolicitudMantenimientoRequest request) {
        validateForeignEntities(request.activoId(), request.tipoMantenimientoId(), request.prioridadId());

        SolicitudMantenimiento domain = findDomainById(id);
        domain.setActivoId(request.activoId());
        domain.setTipoMantenimientoId(request.tipoMantenimientoId());
        domain.setTipoFallas(request.tipoFallas());
        domain.setPrioridadId(request.prioridadId());
        domain.setSolicitanteId(request.solicitanteId());
        domain.setTitulo(requireNormalizedTitulo(request.titulo()));
        domain.setDescripcion(requireNormalizedDescripcion(request.descripcion()));
        domain.setFechaEstimadaOt(request.fechaEstimadaOt());

        if (request.fechaSolicitud() != null) {
            domain.setFechaSolicitud(request.fechaSolicitud());
        }

        return toResponse(repository.save(domain));
    }

    @Transactional
    public SolicitudMantenimientoResponse completarWorkflow(
            UUID solicitudId,
            CompleteWorkflowTaskRequest request) {

        SolicitudMantenimiento solicitud = findDomainById(solicitudId);

        if (solicitud.getProcessInstanceId() == null) {
            throw new ConflictException(
                    "SOLICITUD_SIN_WORKFLOW",
                    "La solicitud no tiene workflow iniciado");
        }

        Map<String, Object> effectiveVariables = new HashMap<>();
        if (request != null && request.variables() != null) {
            effectiveVariables.putAll(request.variables());
        }

        if (!effectiveVariables.containsKey("supervisorId")) {
            if (solicitud.getSupervisorId() != null) {
                effectiveVariables.put("supervisorId", solicitud.getSupervisorId().toString());
            } else if (solicitud.getAprobadoPorId() != null) {
                effectiveVariables.put("supervisorId", solicitud.getAprobadoPorId().toString());
            }
        }

        if (!effectiveVariables.containsKey("responsableId") && solicitud.getResponsableId() != null) {
            effectiveVariables.put("responsableId", solicitud.getResponsableId().toString());
        }

        CompleteWorkflowTaskRequest effectiveRequest = new CompleteWorkflowTaskRequest(effectiveVariables);

        WorkflowTaskActionsResponse resultado = workflowApplicationService.completarTarea(
                solicitud.getProcessInstanceId(),
                effectiveRequest);

        if (resultado.status() != null) {
            solicitud.setEstado(
                    resultado.status().toLowerCase());
        }

        if (request != null && request.variables() != null) {
            Object responsableIdObj = request.variables().get("responsableId");
            if (responsableIdObj != null && !responsableIdObj.toString().isBlank()) {
                try {
                    solicitud.setResponsableId(UUID.fromString(responsableIdObj.toString().trim()));
                    if (solicitud.getFechaAsignacion() == null) {
                        solicitud.setFechaAsignacion(LocalDateTime.now());
                    }
                } catch (Exception ignored) {
                }
            }
            Object obsAprob = request.variables().get("observacionAprobacion");
            if (obsAprob != null && !obsAprob.toString().isBlank()) {
                solicitud.setObservacionAprobacion(obsAprob.toString().trim());
                if (solicitud.getFechaAprobacion() == null) {
                    solicitud.setFechaAprobacion(LocalDateTime.now());
                }
            }
            Object fechaEstimadaOtObj = request.variables().get("fechaEstimadaOt");
            if (fechaEstimadaOtObj != null && !fechaEstimadaOtObj.toString().isBlank()) {
                try {
                    solicitud.setFechaEstimadaOt(LocalDateTime.parse(fechaEstimadaOtObj.toString().trim()));
                } catch (Exception ignored) {
                }
            }
            Object obsVal = request.variables().get("observacionValidacion");
            if (obsVal != null && !obsVal.toString().isBlank()) {
                solicitud.setObservacionValidacion(obsVal.toString().trim());
                if (solicitud.getFechaValidacion() == null) {
                    solicitud.setFechaValidacion(LocalDateTime.now());
                }
            }
            Object obsCierre = request.variables().get("observacionCierre");
            if (obsCierre != null && !obsCierre.toString().isBlank()) {
                solicitud.setObservacionCierre(obsCierre.toString().trim());
                if (solicitud.getFechaFinalizacion() == null) {
                    solicitud.setFechaFinalizacion(LocalDateTime.now());
                }
            }
        }

        return toResponse(
                repository.save(solicitud));
    }

    @Transactional(readOnly = true)
    public SolicitudMantenimientoResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> findAll(String query, PageRequestDto pageRequest) {
        String normalized = StringUtils.normalize(query);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        return PageResponse.from(
                normalized == null ? repository.findAll(pageable) : repository.search(normalized, pageable),
                this::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> findByActivoId(UUID activoId, PageRequestDto pageRequest) {
        requireActivoExists(activoId);
        return PageResponse.from(repository.findByActivoId(activoId, pageRequest.toPageable(SORT_FIELDS)),
                this::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> findByEstado(String estado, PageRequestDto pageRequest) {
        String normalized = requireNormalizedEstado(estado);
        return PageResponse.from(repository.findByEstado(normalized, pageRequest.toPageable(SORT_FIELDS)),
                this::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> findBySolicitanteId(UUID solicitanteId,
            PageRequestDto pageRequest) {
        return PageResponse.from(repository.findBySolicitanteId(solicitanteId, pageRequest.toPageable(SORT_FIELDS)),
                this::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> findByResponsableId(UUID responsableId,
            PageRequestDto pageRequest) {
        return PageResponse.from(repository.findByResponsableId(responsableId, pageRequest.toPageable(SORT_FIELDS)),
                this::toResponse);
    }

    @Transactional
    public void delete(UUID id) {
        findDomainById(id);
        repository.deleteById(id);
    }

    // --- Métodos de apoyo y validaciones ---

    private SolicitudMantenimiento findDomainById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud de mantenimiento", id));
    }

    private void validateForeignEntities(UUID activoId, UUID tipoMantenimientoId, UUID prioridadId) {
        requireActivoExists(activoId);
        requireTipoMantenimientoExists(tipoMantenimientoId);
        requirePrioridadExists(prioridadId);
    }

    private void requireActivoExists(UUID id) {
        if (!activoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Activo", id);
        }
    }

    private void requireTipoMantenimientoExists(UUID id) {
        if (!tipoMantenimientoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tipo de mantenimiento", id);
        }
    }

    private void requirePrioridadExists(UUID id) {
        if (!prioridadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Prioridad", id);
        }
    }

    private String requireNormalizedTitulo(String value) {
        String normalized = StringUtils.normalize(value);
        if (normalized == null || normalized.length() < TITULO_MIN_LENGTH || normalized.length() > TITULO_MAX_LENGTH) {
            throw new BusinessException("INVALID_SOLICITUD_TITULO",
                    "El título debe tener entre %d y %d caracteres".formatted(TITULO_MIN_LENGTH, TITULO_MAX_LENGTH));
        }
        return normalized;
    }

    private String requireNormalizedDescripcion(String value) {
        String normalized = StringUtils.normalize(value);
        if (normalized == null || normalized.length() > DESCRIPCION_MAX_LENGTH) {
            throw new BusinessException("INVALID_SOLICITUD_DESCRIPCION",
                    "La descripción no puede superar los %d caracteres".formatted(DESCRIPCION_MAX_LENGTH));
        }
        return normalized;
    }

    private String requireNormalizedEstado(String value) {
        String normalized = StringUtils.normalize(value);
        if (normalized == null || normalized.length() > 50) {
            throw new BusinessException("INVALID_SOLICITUD_ESTADO", "El estado debe tener entre 1 y 50 caracteres");
        }
        return normalized;
    }

    // --- Mappings ---

    private SolicitudMantenimientoResponse toResponse(SolicitudMantenimiento domain) {
        List<SolicitudMantenimientoAdjuntoResponse> adjuntos = domain.getId() != null
                ? adjuntoRepository.findBySolicitudMantenimientoId(domain.getId())
                        .stream()
                        .map(this::toAdjuntoResponse)
                        .toList()
                : Collections.emptyList();

        return toResponse(domain, adjuntos);
    }

    private SolicitudMantenimientoResponse toResponse(SolicitudMantenimiento domain,
            List<SolicitudMantenimientoAdjuntoResponse> adjuntos) {
        var activoInfo = domain.getActivoId() != null
                ? activoRepository.findById(domain.getActivoId())
                        .map(a -> new SolicitudMantenimientoResponse.ActivoInfo(a.getId(), a.getCodigo(),
                                a.getNombre()))
                        .orElse(null)
                : null;

        var tipoInfo = domain.getTipoMantenimientoId() != null
                ? tipoMantenimientoRepository.findById(domain.getTipoMantenimientoId())
                        .map(t -> new SolicitudMantenimientoResponse.TipoMantenimientoInfo(t.getId(), t.getCodigo(),
                                t.getNombre()))
                        .orElse(null)
                : null;

        var prioridadInfo = domain.getPrioridadId() != null
                ? prioridadRepository.findById(domain.getPrioridadId())
                        .map(p -> new SolicitudMantenimientoResponse.PrioridadInfo(p.getId(), p.getCodigo(),
                                p.getNombre(), p.getNivel()))
                        .orElse(null)
                : null;

        var solicitanteInfo = buildUserInfo(domain.getSolicitanteId());
        var aprobadoPorInfo = buildUserInfo(domain.getAprobadoPorId());
        var responsableInfo = buildUserInfo(domain.getResponsableId());
        var supervisorInfo = buildUserInfo(domain.getSupervisorId());
        var recibidoPorInfo = buildUserInfo(domain.getRecibidoPorId());

        return new SolicitudMantenimientoResponse(
                domain.getId(), domain.getNumero(), activoInfo, tipoInfo,
                domain.getTipoFallas(), prioridadInfo, solicitanteInfo, domain.getTitulo(),
                domain.getDescripcion(), domain.getFechaSolicitud(), aprobadoPorInfo, domain.getFechaAprobacion(),
                domain.getFechaEstimadaOt(), domain.getObservacionAprobacion(), responsableInfo,
                domain.getFechaAsignacion(),
                domain.getFechaInicioMantenimiento(), domain.getFechaFinMantenimiento(), supervisorInfo,
                domain.getFechaValidacion(), domain.getObservacionValidacion(), domain.getFechaFinalizacion(),
                recibidoPorInfo, domain.getObservacionCierre(), domain.getEstado(), domain.getProcessInstanceId(),
                adjuntos != null ? adjuntos : Collections.emptyList(), AuditoriaMapper.from(domain));
    }

    private SolicitudMantenimientoResponse.UserInfo buildUserInfo(UUID empleadoId) {
        if (empleadoId == null) {
            return null;
        }

        return empleadoRepository.findById(empleadoId)
                .map(empleado -> {
                    String nombre = buildNombreCompleto(empleado.getPersonaId());
                    if (nombre == null || nombre.isBlank()) {
                        nombre = empleado.getCodigo();
                    }
                    return new SolicitudMantenimientoResponse.UserInfo(empleado.getId(), nombre);
                })
                .orElse(null);
    }

    private String buildNombreCompleto(UUID personaId) {
        if (personaId == null) {
            return null;
        }

        return personaRepository.findById(personaId)
                .map(this::buildNombreCompleto)
                .orElse(null);
    }

    private String buildNombreCompleto(Persona persona) {
        return Stream.of(
                persona.getNombres(),
                persona.getPrimerApellido(),
                persona.getSegundoApellido())
                .filter(value -> value != null && !value.isBlank())
                .map(String::trim)
                .collect(Collectors.joining(" "));
    }

    private SolicitudMantenimientoAdjuntoResponse toAdjuntoResponse(SolicitudMantenimientoAdjunto domain) {
        return new SolicitudMantenimientoAdjuntoResponse(
                domain.getId(), domain.getSolicitudMantenimientoId(), domain.getNombreArchivo(),
                domain.getTipoContenido(), domain.getSize(), domain.getUrl(), domain.getDescripcion(),
                AuditoriaMapper.from(domain));
    }
}