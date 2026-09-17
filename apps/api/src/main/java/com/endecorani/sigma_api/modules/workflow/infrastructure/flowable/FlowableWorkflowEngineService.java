package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.FlowableVariableRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.StartProcessRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.*;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowEngineService;

import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.FlowablePageResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.HistoricTaskResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.ProcessDefinitionResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.TaskResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.PersonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FlowableWorkflowEngineService implements WorkflowEngineService {

    private final FlowableClient flowableClient;
    private final BpmnDefinitionParser bpmnDefinitionParser;
    private final EmpleadoRepository empleadoRepository;
    private final PersonaRepository personaRepository;

    @Override
    public String iniciarProceso(String processDefinitionKey, String businessKey, Map<String, Object> variables) {

        List<FlowableVariableRequest> flowableVariables = variables.entrySet()
                .stream()
                .map(entry -> new FlowableVariableRequest(
                        entry.getKey(),
                        entry.getValue()))
                .toList();

        StartProcessRequest request = new StartProcessRequest(
                processDefinitionKey,
                businessKey,
                flowableVariables
        );

        ProcessInstanceResponse response = flowableClient.iniciarProceso(request);

        if (response == null || response.id() == null) {
            throw new IllegalStateException(
                    "Flowable no devolvió el identificador de la instancia"
            );
        }

        return response.id();
    }

    @Override
    public WorkflowTaskResponse obtenerTareaActual(String processInstanceId) {

        FlowablePageResponse<TaskResponse> response = flowableClient.obtenerTareasPorProceso(processInstanceId);

        if (response == null
                || response.data() == null
                || response.data().isEmpty()) {
            return null;
        }

        TaskResponse task = response.data().getFirst();

        return new WorkflowTaskResponse(
                task.id(),
                task.name(),
                task.taskDefinitionKey(),
                task.assignee(),
                task.processInstanceId(),
                task.processDefinitionId()
        );
    }

    @Override
    public WorkflowTaskActionsResponse obtenerAccionesDisponibles(
            String processInstanceId
    ) {

        WorkflowTaskResponse task =
                obtenerTareaActual(processInstanceId);

        if (task == null) {
            return new WorkflowTaskActionsResponse(
                    null,
                    null,
                    null,
                    processInstanceId,
                    null,
                    List.of(),
                    List.of()
            );
        }

        ProcessDefinitionResponse processDefinition =
                flowableClient.obtenerProcessDefinition(
                        task.processDefinitionId()
                );

        if (processDefinition == null) {
            throw new IllegalStateException(
                    "No se encontró la definición del proceso"
            );
        }

        String resourceName =
                obtenerNombreRecurso(
                        processDefinition.resource()
                );

        String bpmnXml = cargarBpmnLocal(resourceName);
        if (bpmnXml == null || !bpmnXml.contains("sigma:")) {
            try {
                String remoteBpmn = flowableClient.obtenerBpmn(
                        processDefinition.deploymentId(),
                        resourceName
                );
                if (remoteBpmn != null && remoteBpmn.contains("sigma:")) {
                    bpmnXml = remoteBpmn;
                } else if (bpmnXml == null) {
                    bpmnXml = remoteBpmn;
                }
            } catch (Exception ignored) {
            }
        }

        java.util.Map<String, Object> contextVariables = new java.util.HashMap<>();
        if (task.processInstanceId() != null && !task.processInstanceId().isBlank()) {
            try {
                java.util.List<java.util.Map<String, Object>> processVariables =
                        flowableClient.obtenerVariablesProceso(task.processInstanceId());
                if (processVariables != null) {
                    for (java.util.Map<String, Object> var : processVariables) {
                        Object name = var.get("name");
                        Object value = var.get("value");
                        if (name != null && value != null) {
                            contextVariables.put(name.toString(), value);
                        }
                    }
                }
            } catch (Exception ignored) {
            }
        }

        if (task.assignee() != null && !task.assignee().isBlank()) {
            contextVariables.putIfAbsent("assignee", task.assignee());
            contextVariables.putIfAbsent("aprobadorId", task.assignee());
            contextVariables.putIfAbsent("solicitanteId", task.assignee());
            contextVariables.putIfAbsent("responsableId", task.assignee());
        }

        List<WorkflowFieldResponse> fields =
                bpmnDefinitionParser.obtenerCampos(
                        bpmnXml,
                        task.taskDefinitionKey(),
                        contextVariables
                );

        List<WorkflowActionResponse> actions =
                bpmnDefinitionParser.obtenerAcciones(
                        bpmnXml,
                        task.taskDefinitionKey()
                );

        String status =
                obtenerEstado(task.name());

        return new WorkflowTaskActionsResponse(
                task.id(),
                task.name(),
                task.taskDefinitionKey(),
                task.processInstanceId(),
                status,
                fields,
                actions
        );
    }

    @Override
    public WorkflowHistoryResponse obtenerHistorial(
            String processInstanceId
    ) {

        FlowablePageResponse<HistoricTaskResponse> response =
                flowableClient.obtenerHistorialTareas(
                        processInstanceId
                );

        if (response == null || response.data() == null) {
            return new WorkflowHistoryResponse(
                    processInstanceId,
                    List.of()
            );
        }

        List<WorkflowHistoryItemResponse> items =
                response.data()
                        .stream()
                        .sorted(HISTORIC_TASK_COMPARATOR)
                        .map(task -> {
                            String assigneeName = resolverNombreAsignado(task.assignee());
                            return new WorkflowHistoryItemResponse(
                                    task.id(),
                                    task.taskDefinitionKey(),
                                    task.name(),
                                    task.assignee(),
                                    assigneeName,
                                    task.startTime(),
                                    task.endTime(),
                                    task.endTime() != null
                                            ? "COMPLETADA"
                                            : "ACTIVA"
                            );
                        })
                        .toList();

        return new WorkflowHistoryResponse(
                processInstanceId,
                items
        );
    }

    private static final java.util.Comparator<HistoricTaskResponse> HISTORIC_TASK_COMPARATOR = (t1, t2) -> {
        if (t1 == t2) return 0;
        if (t1 == null) return 1;
        if (t2 == null) return -1;

        java.time.Instant s1 = parseInstant(t1.startTime());
        java.time.Instant s2 = parseInstant(t2.startTime());

        if (s1 != null && s2 != null) {
            int cmp = s1.compareTo(s2);
            if (cmp != 0) return cmp;
        } else if (s1 != null) {
            return -1;
        } else if (s2 != null) {
            return 1;
        }

        java.time.Instant e1 = parseInstant(t1.endTime());
        java.time.Instant e2 = parseInstant(t2.endTime());

        if (e1 != null && e2 != null) {
            int cmp = e1.compareTo(e2);
            if (cmp != 0) return cmp;
        } else if (e1 != null) {
            return -1;
        } else if (e2 != null) {
            return 1;
        }

        if (t1.id() != null && t2.id() != null) {
            return t1.id().compareTo(t2.id());
        }
        return 0;
    };

    private static java.time.Instant parseInstant(String str) {
        if (str == null || str.isBlank()) {
            return null;
        }
        try {
            return java.time.OffsetDateTime.parse(str).toInstant();
        } catch (Exception e1) {
            try {
                return java.time.Instant.parse(str);
            } catch (Exception e2) {
                return null;
            }
        }
    }

    private String resolverNombreAsignado(String assignee) {
        if (assignee == null || assignee.isBlank()) {
            return null;
        }

        try {
            UUID id = UUID.fromString(assignee.trim());

            var empleadoOpt = empleadoRepository.findById(id);
            if (empleadoOpt.isPresent()) {
                var emp = empleadoOpt.get();
                var personaOpt = emp.getPersonaId() != null
                        ? personaRepository.findById(emp.getPersonaId())
                        : java.util.Optional.<com.endecorani.sigma_api.modules.organizacion.domain.model.Persona>empty();

                String nombre = personaOpt.map(com.endecorani.sigma_api.modules.organizacion.domain.model.Persona::getNombreCompleto).orElse(null);
                if (nombre != null && !nombre.isBlank()) {
                    return nombre + (emp.getCodigo() != null ? " [" + emp.getCodigo() + "]" : "");
                }
                return emp.getCodigo() != null ? "Empleado " + emp.getCodigo() : null;
            }

            var personaOpt = personaRepository.findById(id);
            if (personaOpt.isPresent()) {
                return personaOpt.get().getNombreCompleto();
            }

        } catch (IllegalArgumentException ignored) {
            // No es UUID, retornar assignee directamente si ya es un nombre o username
        }

        return assignee;
    }

    @Override
    public void completarTarea(
            String taskId,
            Map<String, Object> variables
    ) {

        var flowableVariables =
                variables.entrySet()
                        .stream()
                        .map(entry ->
                                new FlowableVariableRequest(
                                        entry.getKey(),
                                        entry.getValue()
                                )
                        )
                        .toList();

        CompleteTaskRequest request =
                new CompleteTaskRequest(
                        "complete",
                        flowableVariables
                );

        flowableClient.completarTarea(
                taskId,
                request
        );
    }

    private String obtenerNombreRecurso(
            String resource
    ) {

        if (resource == null || resource.isBlank()) {
            throw new IllegalStateException(
                    "Flowable no devolvió el recurso BPMN"
            );
        }

        int lastSlash =
                resource.lastIndexOf('/');

        return lastSlash >= 0
                ? resource.substring(lastSlash + 1)
                : resource;
    }

    private String obtenerEstado(String taskName) {

        if (taskName == null || taskName.isBlank()) {
            return null;
        }

        int separator =
                taskName.indexOf(" - ");

        if (separator < 0) {
            return taskName
                    .trim()
                    .toUpperCase();
        }

        return taskName
                .substring(0, separator)
                .trim()
                .toUpperCase();
    }

    private String cargarBpmnLocal(String resourceName) {
        if (resourceName == null || resourceName.isBlank()) {
            return null;
        }

        String[] possiblePaths = {
                "/processes/" + resourceName,
                "/processes/" + resourceName.replaceAll("\\.bpmn$", ".bpmn20.xml"),
                "/processes/" + resourceName.replaceAll("\\.bpmn20\\.xml$", ".bpmn"),
                "/processes/solicitudMantenimientoProcess.bpmn20.xml"
        };

        for (String path : possiblePaths) {
            try (var is = getClass().getResourceAsStream(path)) {
                if (is != null) {
                    return new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }
}