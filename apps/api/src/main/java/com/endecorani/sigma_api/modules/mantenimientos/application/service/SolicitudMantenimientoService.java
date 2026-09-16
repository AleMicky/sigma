package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.EnviarSolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResumenResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoTrazabilidadResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.SolicitudMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.criteria.SolicitudMantenimientoSearchCriteria;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoTrazabilidad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoResumenProjection;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoTrazabilidadRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.UsuarioRepository;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.DocumentStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SolicitudMantenimientoService {

    private static final String ESTADO_BORRADOR = "borrador";
    private static final String ESTADO_SOLICITADO = "solicitado";
    private static final String WORKFLOW_CODIGO = "SOLICITUD_MANTENIMIENTO";
    private static final String ADJUNTO_FOLDER = "solicitud_mantenimiento_adjuntos";

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "numero",
            "titulo",
            "fechaSolicitud",
            "estado",
            "createdAt",
            "updatedAt");

    private final SolicitudMantenimientoRepository repository;
    private final SolicitudMantenimientoTrazabilidadRepository trazabilidadRepository;
    private final EmpleadoRepository empleadoRepository;
    private final SpringVEmpleadoRepository vEmpleadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SecurityUtils securityUtils;
    private final SolicitudMantenimientoMapper mapper;
    private final CorrelativoService correlativoService;
    private final WorkflowApplicationService workflowApplicationService;
    private final DocumentStorageService documentStorageService;

    @Transactional(readOnly = true)
    public SolicitudMantenimientoResumenResponse obtenerResumen() {
        return obtenerResumen(null);
    }

    @Transactional(readOnly = true)
    public SolicitudMantenimientoResumenResponse obtenerResumen(String interfaz) {
        UUID solicitanteId = null;
        UUID responsableId = null;
        UUID supervisorId = null;
        UUID aprobadorId = null;

        if (!securityUtils.isAdmin()) {
            UUID empleadoActual = obtenerEmpleadoIdActual();
            if (interfaz == null || interfaz.isBlank() || "SolicitudesPage".equalsIgnoreCase(interfaz.trim())) {
                solicitanteId = empleadoActual;
            } else if ("AprobacionesPage".equalsIgnoreCase(interfaz.trim())) {
                aprobadorId = empleadoActual;
            } else if ("SupervisorMantenimientoPage".equalsIgnoreCase(interfaz.trim())) {
                supervisorId = empleadoActual;
            } else if ("EncargadoMantenimientoPage".equalsIgnoreCase(interfaz.trim())) {
                responsableId = empleadoActual;
            }
        }

        SolicitudMantenimientoResumenProjection projection = repository.obtenerResumen(
                solicitanteId,
                aprobadorId,
                supervisorId,
                responsableId
        );
        return SolicitudMantenimientoResumenResponse.from(projection, interfaz);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> findAll(String q, String estado, PageRequestDto pageRequest) {
        return findAll(q, estado, null, pageRequest);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> findAll(String q, String estado, String interfaz,
            PageRequestDto pageRequest) {
        UUID solicitanteId = null;
        UUID responsableId = null;
        UUID supervisorId = null;
        UUID aprobadorId = null;

        if (!securityUtils.isAdmin()) {
            UUID empleadoActual = obtenerEmpleadoIdActual();
            if (interfaz == null || interfaz.isBlank() || "SolicitudesPage".equalsIgnoreCase(interfaz.trim())) {
                solicitanteId = empleadoActual;
            } else if ("AprobacionesPage".equalsIgnoreCase(interfaz.trim())) {
                aprobadorId = empleadoActual;
            } else if ("SupervisorMantenimientoPage".equalsIgnoreCase(interfaz.trim())) {
                supervisorId = empleadoActual;
            } else if ("EncargadoMantenimientoPage".equalsIgnoreCase(interfaz.trim())) {
                responsableId = empleadoActual;
            }
        }

        List<String> estados = resolverEstados(estado, interfaz);

        SolicitudMantenimientoSearchCriteria criteria = new SolicitudMantenimientoSearchCriteria(
                q,
                estados,
                solicitanteId,
                responsableId,
                supervisorId,
                null,
                aprobadorId);
        return findAll(criteria, pageRequest);
    }

    // Estados del BPMN (solicitudMantenimientoProcess.bpmn20.xml)
    public static final String ESTADO_BPMN_BORRADOR = "BORRADOR";
    public static final String ESTADO_BPMN_SOLICITADO = "SOLICITADO";
    public static final String ESTADO_BPMN_OBSERVADO = "OBSERVADO";
    public static final String ESTADO_BPMN_ASIGNADO = "ASIGNADO";
    public static final String ESTADO_BPMN_EN_MANTENIMIENTO = "EN_MANTENIMIENTO";
    public static final String ESTADO_BPMN_EN_REVISION = "EN_REVISION";
    public static final String ESTADO_BPMN_OBSERVADO_MANTENIMIENTO = "OBSERVADO_MANTENIMIENTO";
    public static final String ESTADO_BPMN_VALIDADO = "VALIDADO";
    public static final String ESTADO_BPMN_TRABAJO_REALIZADO = "TRABAJO_REALIZADO";
    public static final String ESTADO_BPMN_FINALIZADO = "FINALIZADO";

    public static List<String> resolverEstados(String estado) {
        return resolverEstados(estado, null);
    }

    public static List<String> resolverEstados(String estado, String interfaz) {
        if (estado == null || estado.isBlank()) {
            return Collections.emptyList();
        }
        String normalized = estado.trim().toUpperCase().replace("-", "_");

        // Para la bandeja de ejecución del técnico/encargado, EN_MANTENIMIENTO incluye estados activos de ejecución técnica
        if ("EncargadoMantenimientoPage".equalsIgnoreCase(interfaz != null ? interfaz.trim() : "")) {
            if ("EN_MANTENIMIENTO".equals(normalized)) {
                return List.of(
                        ESTADO_BPMN_EN_MANTENIMIENTO,
                        ESTADO_BPMN_OBSERVADO_MANTENIMIENTO,
                        ESTADO_BPMN_VALIDADO
                );
            }
        }

        return switch (normalized) {
            // Grupos de estados para las tarjetas de resumen y filtros
            case "BORRADOR", "BORRADORES" -> List.of(
                    ESTADO_BPMN_BORRADOR
            );
            case "ENREVISION", "REVISION", "REVISIONES" -> List.of(
                    ESTADO_BPMN_SOLICITADO,
                    ESTADO_BPMN_OBSERVADO
            );
            case "EN_PROCESO", "ENPROCESO", "PROCESO" -> List.of(
                    ESTADO_BPMN_SOLICITADO,
                    ESTADO_BPMN_OBSERVADO,
                    ESTADO_BPMN_ASIGNADO,
                    ESTADO_BPMN_EN_MANTENIMIENTO,
                    ESTADO_BPMN_EN_REVISION,
                    ESTADO_BPMN_OBSERVADO_MANTENIMIENTO,
                    ESTADO_BPMN_VALIDADO
            );
            case "FINALIZADA", "FINALIZADO", "FINALIZADAS", "FINALIZADOS" -> List.of(
                    ESTADO_BPMN_TRABAJO_REALIZADO,
                    ESTADO_BPMN_FINALIZADO,
                    "CERRADO"
            );

            // Estados directos individuales del BPMN
            case "SOLICITADO" -> List.of(ESTADO_BPMN_SOLICITADO);
            case "OBSERVADO" -> List.of(ESTADO_BPMN_OBSERVADO);
            case "ASIGNADO" -> List.of(ESTADO_BPMN_ASIGNADO);
            // EN_MANTENIMIENTO filtra todos los estados posteriores a ASIGNADO
            case "EN_MANTENIMIENTO" -> List.of(
                    ESTADO_BPMN_EN_MANTENIMIENTO,
                    ESTADO_BPMN_EN_REVISION,
                    ESTADO_BPMN_OBSERVADO_MANTENIMIENTO,
                    ESTADO_BPMN_VALIDADO,
                    ESTADO_BPMN_TRABAJO_REALIZADO,
                    ESTADO_BPMN_FINALIZADO,
                    "CERRADO"
            );
            case "EN_REVISION" -> List.of(ESTADO_BPMN_EN_REVISION);
            case "OBSERVADO_MANTENIMIENTO" -> List.of(ESTADO_BPMN_OBSERVADO_MANTENIMIENTO);
            case "VALIDADO" -> List.of(ESTADO_BPMN_VALIDADO);
            case "TRABAJO_REALIZADO", "TRABAJO_CONCLUIDO" -> List.of(
                    ESTADO_BPMN_TRABAJO_REALIZADO,
                    ESTADO_BPMN_FINALIZADO,
                    "CERRADO"
            );

            default -> List.of(normalized);
        };
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> findAll(SolicitudMantenimientoSearchCriteria criteria,
            PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<SolicitudMantenimiento> resultado = repository.findAll(criteria, pageable);
        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudMantenimientoResponse> listar(String search, PageRequestDto pageRequest) {
        String normalized = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<SolicitudMantenimiento> resultado;

        if (normalized == null || normalized.isBlank()) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.search(normalized, pageable);
        }

        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public SolicitudMantenimientoResponse findById(UUID id) {
        SolicitudMantenimiento solicitud = obtenerPorId(id);
        return mapper.toResponse(solicitud);
    }

    @Transactional
    public SolicitudMantenimientoResponse create(SolicitudMantenimientoRequest dto) {

        String numero = correlativoService.generar(CorrelativoCodigo.SOLICITUD_MANTENIMIENTO,
                LocalDateTime.now().getYear());

        SolicitudMantenimiento solicitud = mapper.toDomain(dto);

        solicitud.setNumero(numero);
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setEstado(ESTADO_BORRADOR);

        SolicitudMantenimiento guardado = repository.save(solicitud);

        if (guardado.getId() != null) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("solicitudId", guardado.getId().toString());
            if (guardado.getSolicitante() != null && guardado.getSolicitante().getId() != null) {
                variables.put("solicitanteId", guardado.getSolicitante().getId().toString());
            }

            String processInstanceId = workflowApplicationService.iniciar(
                    WORKFLOW_CODIGO,
                    guardado.getId().toString(),
                    variables);

            guardado.setProcessInstanceId(processInstanceId);
            guardado = repository.save(guardado);
        }

        UUID creadorEmpleadoId = obtenerEmpleadoIdActual();
        if (creadorEmpleadoId == null && guardado.getSolicitante() != null) {
            creadorEmpleadoId = guardado.getSolicitante().getId();
        }
        registrarTrazabilidad(
                guardado.getId(),
                null,
                guardado.getEstado(),
                "Creación de la solicitud en borrador",
                creadorEmpleadoId);

        return toResponse(guardado);
    }

    @Transactional
    public SolicitudMantenimientoResponse createWithFiles(SolicitudMantenimientoRequest request,
            List<MultipartFile> files) {
        SolicitudMantenimientoResponse response = create(request);

        if (files == null || files.isEmpty()) {
            return response;
        }

        SolicitudMantenimiento solicitud = obtenerPorId(response.id());

        files.forEach(file -> {
            DocumentStorageService.StoredFile stored = documentStorageService.store(ADJUNTO_FOLDER,
                    UUID.randomUUID(), file);
            SolicitudMantenimientoAdjunto adjunto = SolicitudMantenimientoAdjunto.builder()
                    .solicitudMantenimientoId(response.id())
                    .nombreArchivo(stored.nombreOriginal())
                    .tipoContenido(stored.mimeType())
                    .size(stored.tamanoBytes())
                    .url(stored.publicUrl())
                    .build();
            solicitud.getAdjuntos().add(adjunto);
        });

        return toResponse(repository.save(solicitud));
    }

    @Transactional
    public SolicitudMantenimientoResponse update(UUID id, SolicitudMantenimientoRequest dto) {
        SolicitudMantenimiento actual = obtenerPorId(id);

        // El mapper updateDomain de Request no existe, usualmente es de
        // SolicitudMantenimientoUpdate,
        // pero podemos crear uno nuevo de Request a Model, o simplemente usar toDomain.
        // Dado que solo queremos mapear:
        actual.setTitulo(dto.titulo());
        actual.setDescripcion(dto.descripcion());
        actual.setTipoFallas(dto.tipoFallas());
        // Map other relationships if you want.

        SolicitudMantenimiento actualizado = repository.save(actual);
        return toResponse(actualizado);
    }

    @Transactional
    public SolicitudMantenimientoResponse enviar(UUID id, EnviarSolicitudMantenimientoRequest request) {

        SolicitudMantenimiento solicitud = obtenerPorId(id);

        if (!ESTADO_BORRADOR.equalsIgnoreCase(solicitud.getEstado())) {
            throw new ConflictException(
                    "SOLICITUD_ESTADO_INVALIDO",
                    "Solo se puede enviar una solicitud en estado BORRADOR");
        }

        String estadoAnterior = solicitud.getEstado();

        UUID aprobadorId = request.aprobadorId();
        if (aprobadorId == null) {
            throw new BusinessException(
                    "APROBADOR_REQUERIDO",
                    "Debe seleccionar un aprobador");
        }

        Empleado aprobador = empleadoRepository.findById(aprobadorId)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", aprobadorId));
        solicitud.setAprobador(aprobador);

        if (request.responsableId() != null) {
            Empleado responsable = empleadoRepository.findById(request.responsableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Empleado responsable", request.responsableId()));
            solicitud.setResponsable(responsable);
        }

        if (request.supervisorId() != null) {
            Empleado supervisor = empleadoRepository.findById(request.supervisorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Empleado supervisor", request.supervisorId()));
            solicitud.setSupervisor(supervisor);
        }

        Map<String, Object> variables = new HashMap<>();
        variables.put("solicitudId", solicitud.getId().toString());
        if (solicitud.getSolicitante() != null && solicitud.getSolicitante().getId() != null) {
            variables.put("solicitanteId", solicitud.getSolicitante().getId().toString());
        }
        variables.put("aprobadorId", aprobadorId.toString());

        if (request.responsableId() != null) {
            variables.put("responsableId", request.responsableId().toString());
        }

        String supervisorIdStr = solicitud.getSupervisor() != null && solicitud.getSupervisor().getId() != null
                ? solicitud.getSupervisor().getId().toString()
                : aprobadorId.toString();
        variables.put("supervisorId", supervisorIdStr);

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

        solicitud.setEstado(ESTADO_SOLICITADO);

        SolicitudMantenimiento actualizado = repository.save(solicitud);

        UUID actorEmpleadoId = obtenerEmpleadoIdActual();
        if (actorEmpleadoId == null && actualizado.getSolicitante() != null) {
            actorEmpleadoId = actualizado.getSolicitante().getId();
        }
        registrarTrazabilidad(
                actualizado.getId(),
                estadoAnterior,
                ESTADO_SOLICITADO,
                "Envío de la solicitud para aprobación",
                actorEmpleadoId);

        return toResponse(actualizado);
    }

    @Transactional
    public SolicitudMantenimientoResponse completarWorkflow(UUID solicitudId, CompleteWorkflowTaskRequest request) {

        SolicitudMantenimiento solicitud = obtenerPorId(solicitudId);

        if (solicitud.getProcessInstanceId() == null) {
            throw new ConflictException(
                    "SOLICITUD_SIN_WORKFLOW",
                    "La solicitud no tiene workflow iniciado");
        }

        String estadoAnterior = solicitud.getEstado();

        Map<String, Object> effectiveVariables = new HashMap<>();
        if (request != null && request.variables() != null) {
            effectiveVariables.putAll(request.variables());
        }

        if (!effectiveVariables.containsKey("supervisorId")) {
            if (solicitud.getSupervisor() != null && solicitud.getSupervisor().getId() != null) {
                effectiveVariables.put("supervisorId", solicitud.getSupervisor().getId().toString());
            } else if (solicitud.getAprobador() != null && solicitud.getAprobador().getId() != null) {
                effectiveVariables.put("supervisorId", solicitud.getAprobador().getId().toString());
            }
        }

        if (!effectiveVariables.containsKey("responsableId") && solicitud.getResponsable() != null
                && solicitud.getResponsable().getId() != null) {
            effectiveVariables.put("responsableId", solicitud.getResponsable().getId().toString());
        }

        CompleteWorkflowTaskRequest effectiveRequest = new CompleteWorkflowTaskRequest(effectiveVariables);

        WorkflowTaskActionsResponse resultado = workflowApplicationService.completarTarea(
                solicitud.getProcessInstanceId(),
                effectiveRequest);

        String nuevoEstado = resultado.status() != null ? resultado.status().toLowerCase().trim() : null;
        if (nuevoEstado != null) {
            solicitud.setEstado(nuevoEstado);
        }

        LocalDateTime ahora = LocalDateTime.now();

        if (request != null && request.variables() != null) {
            Object aprobadorIdObj = request.variables().get("aprobadorId");
            if (aprobadorIdObj != null && !aprobadorIdObj.toString().isBlank()) {
                try {
                    empleadoRepository.findById(UUID.fromString(aprobadorIdObj.toString().trim()))
                            .ifPresent(solicitud::setAprobador);
                } catch (Exception ignored) {
                }
            }

            Object responsableIdObj = request.variables().get("responsableId");
            if (responsableIdObj != null && !responsableIdObj.toString().isBlank()) {
                try {
                    empleadoRepository.findById(UUID.fromString(responsableIdObj.toString().trim()))
                            .ifPresent(solicitud::setResponsable);
                } catch (Exception ignored) {
                }
            }

            Object supervisorIdObj = request.variables().get("supervisorId");
            if (supervisorIdObj != null && !supervisorIdObj.toString().isBlank()) {
                try {
                    empleadoRepository.findById(UUID.fromString(supervisorIdObj.toString().trim()))
                            .ifPresent(solicitud::setSupervisor);
                } catch (Exception ignored) {
                }
            }
        }

        if (nuevoEstado != null) {
            switch (nuevoEstado.toUpperCase()) {
                case "EN_MANTENIMIENTO":
                    if (solicitud.getFechaInicioMantenimiento() == null) {
                        solicitud.setFechaInicioMantenimiento(ahora);
                    }
                    break;
                case "EN_REVISION":
                    if (solicitud.getFechaFinMantenimiento() == null) {
                        solicitud.setFechaFinMantenimiento(ahora);
                    }
                    break;
                case "FINALIZADO":
                    if (solicitud.getFechaCierre() == null) {
                        solicitud.setFechaCierre(ahora);
                    }
                    break;
            }
        }

        SolicitudMantenimiento guardado = repository.save(solicitud);

        if (nuevoEstado != null && !nuevoEstado.equalsIgnoreCase(estadoAnterior)) {
            String comentario = "Cambio de estado en el flujo de trabajo";
            if (request != null && request.variables() != null) {
                if (request.variables().get("comentario") != null
                        && !request.variables().get("comentario").toString().isBlank()) {
                    comentario = request.variables().get("comentario").toString().trim();
                } else if (request.variables().get("observacion") != null
                        && !request.variables().get("observacion").toString().isBlank()) {
                    comentario = request.variables().get("observacion").toString().trim();
                } else if (request.variables().get("motivo") != null
                        && !request.variables().get("motivo").toString().isBlank()) {
                    comentario = request.variables().get("motivo").toString().trim();
                }
            }
            UUID actorEmpleadoId = resolverEmpleadoIdParaWorkflow(request, guardado);
            registrarTrazabilidad(
                    guardado.getId(),
                    estadoAnterior,
                    nuevoEstado,
                    comentario,
                    actorEmpleadoId);
        }

        return toResponse(guardado);
    }

    @Transactional(readOnly = true)
    public List<SolicitudMantenimientoTrazabilidadResponse> obtenerTrazabilidad(UUID solicitudId) {
        obtenerPorId(solicitudId);
        List<SolicitudMantenimientoTrazabilidad> trazabilidades = trazabilidadRepository
                .findBySolicitudMantenimientoId(solicitudId);
        if (trazabilidades.isEmpty()) {
            return List.of();
        }

        Set<UUID> empleadoIds = trazabilidades.stream()
                .map(SolicitudMantenimientoTrazabilidad::getEmpleadoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, VEmpleadoEntity> vEmpleadosMap = empleadoIds.isEmpty()
                ? Collections.emptyMap()
                : vEmpleadoRepository.findAllById(empleadoIds).stream()
                        .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, e -> e, (a, b) -> a));

        return trazabilidades.stream()
                .map(t -> {
                    VEmpleadoEntity ve = vEmpleadosMap.get(t.getEmpleadoId());
                    SolicitudMantenimientoResponse.EmpleadoInfo info = ve != null
                            ? new SolicitudMantenimientoResponse.EmpleadoInfo(ve.getEmpleadoId(), ve.getNombreCompleto(), ve.getCargo())
                            : new SolicitudMantenimientoResponse.EmpleadoInfo(t.getEmpleadoId(), null, null);
                    return new SolicitudMantenimientoTrazabilidadResponse(
                            t.getId(),
                            t.getSolicitudMantenimientoId(),
                            t.getEstadoAnterior(),
                            t.getEstadoNuevo(),
                            t.getComentario(),
                            t.getEmpleadoId(),
                            info,
                            t.getFecha());
                })
                .toList();
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private SolicitudMantenimiento obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud de mantenimiento", id));
    }

    private void registrarTrazabilidad(UUID solicitudId, String estadoAnterior, String estadoNuevo, String comentario,
            UUID empleadoId) {
        if (solicitudId == null || estadoNuevo == null) {
            return;
        }

        if (empleadoId == null) {
            SolicitudMantenimiento s = repository.findById(solicitudId).orElse(null);
            if (s != null && s.getSolicitante() != null && s.getSolicitante().getId() != null) {
                empleadoId = s.getSolicitante().getId();
            }
        }

        if (empleadoId == null) {
            log.warn("No se pudo registrar trazabilidad para solicitud {} porque no se encontró empleadoId asociado",
                    solicitudId);
            return;
        }

        SolicitudMantenimientoTrazabilidad trazabilidad = SolicitudMantenimientoTrazabilidad.builder()
                .solicitudMantenimientoId(solicitudId)
                .estadoAnterior(estadoAnterior)
                .estadoNuevo(estadoNuevo)
                .comentario(comentario)
                .empleadoId(empleadoId)
                .fecha(LocalDateTime.now())
                .build();

        trazabilidadRepository.save(trazabilidad);
    }

    private UUID obtenerEmpleadoIdActual() {
        return securityUtils.getCurrentUserId()
                .flatMap(usuarioRepository::findById)
                .map(Usuario::getPersonaId)
                .flatMap(empleadoRepository::findFirstByPersonaId)
                .map(Empleado::getId)
                .orElse(null);
    }

    private UUID resolverEmpleadoIdParaWorkflow(CompleteWorkflowTaskRequest request, SolicitudMantenimiento solicitud) {
        UUID currentEmpId = obtenerEmpleadoIdActual();
        if (currentEmpId != null) {
            return currentEmpId;
        }

        if (request != null && request.variables() != null) {
            Object empIdObj = request.variables().get("empleadoId");
            if (empIdObj != null && !empIdObj.toString().isBlank()) {
                try {
                    return UUID.fromString(empIdObj.toString().trim());
                } catch (Exception ignored) {
                }
            }
            Object responsableIdObj = request.variables().get("responsableId");
            if (responsableIdObj != null && !responsableIdObj.toString().isBlank()) {
                try {
                    return UUID.fromString(responsableIdObj.toString().trim());
                } catch (Exception ignored) {
                }
            }
            Object supervisorIdObj = request.variables().get("supervisorId");
            if (supervisorIdObj != null && !supervisorIdObj.toString().isBlank()) {
                try {
                    return UUID.fromString(supervisorIdObj.toString().trim());
                } catch (Exception ignored) {
                }
            }
            Object aprobadorIdObj = request.variables().get("aprobadorId");
            if (aprobadorIdObj != null && !aprobadorIdObj.toString().isBlank()) {
                try {
                    return UUID.fromString(aprobadorIdObj.toString().trim());
                } catch (Exception ignored) {
                }
            }
        }

        if (solicitud.getResponsable() != null && solicitud.getResponsable().getId() != null) {
            return solicitud.getResponsable().getId();
        }
        if (solicitud.getSupervisor() != null && solicitud.getSupervisor().getId() != null) {
            return solicitud.getSupervisor().getId();
        }
        if (solicitud.getAprobador() != null && solicitud.getAprobador().getId() != null) {
            return solicitud.getAprobador().getId();
        }
        if (solicitud.getSolicitante() != null && solicitud.getSolicitante().getId() != null) {
            return solicitud.getSolicitante().getId();
        }

        return null;
    }

    public SolicitudMantenimientoResponse toResponse(SolicitudMantenimiento domain) {
        if (domain == null) {
            return null;
        }
        if (domain.getId() != null && (domain.getSolicitante() == null || domain.getSolicitante().getNombreCompleto() == null)) {
            return repository.findById(domain.getId()).map(mapper::toResponse).orElseGet(() -> mapper.toResponse(domain));
        }
        return mapper.toResponse(domain);
    }
}
