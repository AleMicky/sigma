package com.endecorani.sigma_api.modules.incidentes.application.service;

import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request.CancelarIncidenteRequest;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request.EjecutarAccionIncidenteRequest;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request.IncidenteActivoRequest;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request.IncidenteActivoUpdate;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.response.IncidenteActivoResponse;
import com.endecorani.sigma_api.modules.incidentes.application.mapper.IncidenteActivoMapper;
import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteActivo;
import com.endecorani.sigma_api.modules.incidentes.domain.repository.IncidenteActivoRepository;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowActionResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowHistoryResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class IncidenteActivoService {

    public static final String WORKFLOW_CODIGO = "INCIDENTE_ACTIVO";
    public static final String ESTADO_REGISTRADO = "REGISTRADO";
    public static final String ESTADO_REVISION = "REVISION";
    public static final String ESTADO_EN_ATENCION = "EN_ATENCION";
    public static final String ESTADO_VALIDACION = "VALIDACION";
    public static final String ESTADO_EN_CIERRE = "EN_CIERRE";
    public static final String ESTADO_CERRADO = "CERRADO";
    public static final String ESTADO_RECHAZADO = "RECHAZADO";
    public static final String ESTADO_CANCELADO = "CANCELADO";

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "tipoIncidente",
            "prioridad",
            "estado",
            "fechaHora",
            "createdAt",
            "updatedAt"
    );

    private final IncidenteActivoRepository repository;
    private final ActivoRepository activoRepository;
    private final IncidenteActivoMapper mapper;
    private final WorkflowApplicationService workflowApplicationService;

    // ==========================================
    // 1. Operaciones Principales del Incidente
    // ==========================================

    @Transactional
    public IncidenteActivoResponse registrar(IncidenteActivoRequest request) {
        if (!activoRepository.existsById(request.activoId())) {
            throw new ResourceNotFoundException("Activo", request.activoId());
        }

        IncidenteActivo domain = mapper.toDomain(request);
        if (domain.getEstado() == null || domain.getEstado().isBlank()) {
            domain.setEstado(ESTADO_REGISTRADO);
        }

        IncidenteActivo guardado = repository.save(domain);

        // Iniciar proceso Flowable
        Map<String, Object> variables = new HashMap<>();
        variables.put("incidenteId", guardado.getId().toString());
        variables.put("activoId", request.activoId().toString());
        variables.put("tipoIncidente", guardado.getTipoIncidente());
        variables.put("prioridad", guardado.getPrioridad());
        variables.put("empleadoReportaId", request.empleadoReportaId().toString());
        if (guardado.getDescripcion() != null) {
            variables.put("descripcion", guardado.getDescripcion());
        }

        try {
            String processInstanceId = workflowApplicationService.iniciar(
                    WORKFLOW_CODIGO,
                    guardado.getId().toString(),
                    variables
            );
            guardado.setProcessInstanceId(processInstanceId);
            guardado.setEstado(ESTADO_REVISION);
            guardado = repository.save(guardado);
        } catch (Exception ex) {
            log.warn("No se pudo iniciar el proceso Flowable para el incidente {}: {}", guardado.getId(), ex.getMessage());
        }

        return mapper.toResponse(guardado);
    }

    @Transactional(readOnly = true)
    public PageResponse<IncidenteActivoResponse> listar(
            String search,
            String tipoIncidente,
            String prioridad,
            String estado,
            UUID activoId,
            PageRequestDto pageRequest
    ) {
        String normalizedSearch = StringUtils.normalize(search);
        String normalizedTipo = StringUtils.normalize(tipoIncidente);
        String normalizedPrioridad = StringUtils.normalize(prioridad);
        String normalizedEstado = StringUtils.normalize(estado);

        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<IncidenteActivo> resultado = repository.searchWithFilters(
                normalizedSearch,
                normalizedTipo,
                normalizedPrioridad,
                normalizedEstado,
                activoId,
                pageable
        );

        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public IncidenteActivoResponse obtenerPorId(UUID id) {
        IncidenteActivo domain = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente", id));
        return mapper.toResponse(domain);
    }

    @Transactional
    public IncidenteActivoResponse actualizar(UUID id, IncidenteActivoUpdate request) {
        IncidenteActivo domain = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente", id));

        String estadoActual = domain.getEstado() != null ? domain.getEstado().toUpperCase() : "";
        if (ESTADO_CERRADO.equals(estadoActual) || ESTADO_RECHAZADO.equals(estadoActual) || ESTADO_CANCELADO.equals(estadoActual)) {
            throw new BusinessException("No se puede modificar un incidente que ya está en estado " + estadoActual);
        }

        if (request.activoId() != null && !activoRepository.existsById(request.activoId())) {
            throw new ResourceNotFoundException("Activo", request.activoId());
        }

        mapper.updateDomain(request, domain);
        IncidenteActivo actualizado = repository.save(domain);
        return mapper.toResponse(actualizado);
    }

    @Transactional(readOnly = true)
    public List<IncidenteActivoResponse> listarPorActivo(UUID activoId) {
        if (!activoRepository.existsById(activoId)) {
            throw new ResourceNotFoundException("Activo", activoId);
        }
        return repository.findByActivoId(activoId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public IncidenteActivoResponse cancelar(UUID id, CancelarIncidenteRequest request) {
        IncidenteActivo incidente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente", id));

        String estadoActual = incidente.getEstado() != null ? incidente.getEstado().toUpperCase() : "";
        if (ESTADO_CERRADO.equals(estadoActual) || ESTADO_RECHAZADO.equals(estadoActual) || ESTADO_CANCELADO.equals(estadoActual)) {
            throw new BusinessException("No se puede cancelar un incidente que ya está en " + estadoActual);
        }

        String motivo = request != null && request.motivo() != null && !request.motivo().isBlank()
                ? request.motivo().trim()
                : "Cancelado a solicitud del usuario";

        if (incidente.getProcessInstanceId() != null) {
            try {
                workflowApplicationService.cancelarProceso(incidente.getProcessInstanceId(), motivo);
            } catch (Exception ex) {
                log.warn("Error al cancelar proceso en Flowable para incidente {}: {}", id, ex.getMessage());
            }
        }

        incidente.setEstado(ESTADO_CANCELADO);
        IncidenteActivo guardado = repository.save(incidente);
        return mapper.toResponse(guardado);
    }

    // ==========================================
    // 2. Integración Dinámica con Flowable BPMN
    // ==========================================

    @Transactional(readOnly = true)
    public WorkflowTaskResponse obtenerTareaActual(UUID id) {
        IncidenteActivo incidente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente", id));

        if (incidente.getProcessInstanceId() == null) {
            throw new BusinessException("El incidente no tiene un proceso Flowable asociado");
        }

        return workflowApplicationService.obtenerTareaActual(incidente.getProcessInstanceId());
    }

    @Transactional(readOnly = true)
    public WorkflowTaskActionsResponse obtenerAcciones(UUID id) {
        IncidenteActivo incidente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente", id));

        if (incidente.getProcessInstanceId() == null) {
            throw new BusinessException("El incidente no tiene un proceso Flowable asociado");
        }

        return workflowApplicationService.obtenerAccionesDisponibles(incidente.getProcessInstanceId());
    }

    @Transactional
    public IncidenteActivoResponse ejecutarAccion(UUID id, String accionId, EjecutarAccionIncidenteRequest request) {
        IncidenteActivo incidente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente", id));

        if (incidente.getProcessInstanceId() == null) {
            throw new BusinessException("El incidente no tiene un proceso Flowable activo");
        }

        WorkflowTaskActionsResponse tareaActual = workflowApplicationService.obtenerAccionesDisponibles(incidente.getProcessInstanceId());
        if (tareaActual == null || tareaActual.taskId() == null) {
            throw new BusinessException("El proceso Flowable no tiene una tarea activa pendiente para ejecutar acciones");
        }

        // Buscar acción coincidente
        WorkflowActionResponse matchingAction = null;
        if (tareaActual.actions() != null) {
            matchingAction = tareaActual.actions().stream()
                    .filter(a -> a.value().equalsIgnoreCase(accionId)
                            || a.name().equalsIgnoreCase(accionId)
                            || accionId.equalsIgnoreCase(a.value().replaceAll("[^A-Za-z0-9]", "_"))
                            || accionId.equalsIgnoreCase(a.value().replaceAll("_", "-")))
                    .findFirst()
                    .orElse(null);
        }

        if (matchingAction == null && tareaActual.actions() != null && !tareaActual.actions().isEmpty()) {
            matchingAction = tareaActual.actions().getFirst();
        }

        Map<String, Object> effectiveVariables = new HashMap<>();
        if (request != null && request.variables() != null) {
            effectiveVariables.putAll(request.variables());
        }

        String actionValue = matchingAction != null ? matchingAction.value() : accionId.toUpperCase();
        String actionVar = matchingAction != null ? matchingAction.variable() : "action";

        effectiveVariables.put(actionVar, actionValue);
        effectiveVariables.put("action", actionValue);
        effectiveVariables.put("accion", actionValue);

        // Mapear variables form properties del BPMN procesoIncidentesActivos
        String taskKey = tareaActual.taskDefinitionKey() != null ? tareaActual.taskDefinitionKey().toLowerCase() : "";
        if (request != null) {
            if ("revision".equals(taskKey)) {
                if (request.aprobado() != null) {
                    effectiveVariables.put("aprobado", request.aprobado());
                } else if ("RECHAZAR".equalsIgnoreCase(actionValue) || "NO".equalsIgnoreCase(actionValue)) {
                    effectiveVariables.put("aprobado", false);
                } else {
                    effectiveVariables.put("aprobado", true);
                }
                if (request.observacionRevision() != null) {
                    effectiveVariables.put("observacionRevision", request.observacionRevision().trim());
                } else if (request.observacion() != null) {
                    effectiveVariables.put("observacionRevision", request.observacion().trim());
                }
            } else if ("atencion".equals(taskKey)) {
                if (request.detalleAtencion() != null) {
                    effectiveVariables.put("detalleAtencion", request.detalleAtencion().trim());
                } else if (request.observacion() != null) {
                    effectiveVariables.put("detalleAtencion", request.observacion().trim());
                } else {
                    effectiveVariables.put("detalleAtencion", "Atención registrada");
                }
            } else if ("validacion".equals(taskKey)) {
                if (request.solucionAprobada() != null) {
                    effectiveVariables.put("solucionAprobada", request.solucionAprobada());
                } else if ("RECHAZAR".equalsIgnoreCase(actionValue) || "RETRABAJO".equalsIgnoreCase(actionValue) || "NO".equalsIgnoreCase(actionValue)) {
                    effectiveVariables.put("solucionAprobada", false);
                } else {
                    effectiveVariables.put("solucionAprobada", true);
                }
                if (request.observacionValidacion() != null) {
                    effectiveVariables.put("observacionValidacion", request.observacionValidacion().trim());
                } else if (request.observacion() != null) {
                    effectiveVariables.put("observacionValidacion", request.observacion().trim());
                }
            } else if ("cierre".equals(taskKey)) {
                if (request.observacionCierre() != null) {
                    effectiveVariables.put("observacionCierre", request.observacionCierre().trim());
                } else if (request.observacion() != null) {
                    effectiveVariables.put("observacionCierre", request.observacion().trim());
                }
            }
        }

        CompleteWorkflowTaskRequest taskRequest = new CompleteWorkflowTaskRequest(effectiveVariables);
        WorkflowTaskActionsResponse resultado = workflowApplicationService.completarTarea(
                incidente.getProcessInstanceId(), taskRequest
        );

        // Sincronizar estado del incidente según la siguiente tarea o finalización del proceso
        if (resultado == null || resultado.taskId() == null) {
            // Proceso finalizado
            if ("revision".equals(taskKey) && Boolean.FALSE.equals(effectiveVariables.get("aprobado"))) {
                incidente.setEstado(ESTADO_RECHAZADO);
            } else {
                incidente.setEstado(ESTADO_CERRADO);
            }
        } else {
            String nextTaskKey = resultado.taskDefinitionKey() != null ? resultado.taskDefinitionKey().toLowerCase() : "";
            switch (nextTaskKey) {
                case "revision" -> incidente.setEstado(ESTADO_REVISION);
                case "atencion" -> incidente.setEstado(ESTADO_EN_ATENCION);
                case "validacion" -> incidente.setEstado(ESTADO_VALIDACION);
                case "cierre" -> incidente.setEstado(ESTADO_EN_CIERRE);
                default -> {
                    if (resultado.taskName() != null && !resultado.taskName().isBlank()) {
                        incidente.setEstado(resultado.taskName().toUpperCase().replace(" ", "_"));
                    }
                }
            }
        }

        IncidenteActivo actualizada = repository.save(incidente);
        return mapper.toResponse(actualizada);
    }

    @Transactional(readOnly = true)
    public WorkflowHistoryResponse obtenerHistorialProceso(UUID id) {
        IncidenteActivo incidente = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidente", id));

        if (incidente.getProcessInstanceId() == null) {
            throw new BusinessException("El incidente no tiene un proceso Flowable asociado");
        }

        return workflowApplicationService.obtenerHistorial(incidente.getProcessInstanceId());
    }
}
