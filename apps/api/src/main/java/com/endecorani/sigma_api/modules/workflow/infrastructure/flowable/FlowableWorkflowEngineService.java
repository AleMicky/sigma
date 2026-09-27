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

    private final java.util.Map<String, String> bpmnCache = new java.util.concurrent.ConcurrentHashMap<>();

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

        String cacheKey = (processDefinition.deploymentId() != null ? processDefinition.deploymentId() : "") + ":" + resourceName;
        String bpmnXml = bpmnCache.computeIfAbsent(cacheKey, k -> {
            String xml = cargarBpmnLocal(resourceName);
            if (xml == null || !xml.contains("sigma:")) {
                try {
                    String remoteBpmn = flowableClient.obtenerBpmn(
                            processDefinition.deploymentId(),
                            resourceName
                    );
                    if (remoteBpmn != null && remoteBpmn.contains("sigma:")) {
                        xml = remoteBpmn;
                    } else if (xml == null) {
                        xml = remoteBpmn;
                    }
                } catch (Exception ignored) {
                }
            }
            return xml != null ? xml : "";
        });

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
            contextVariables.putIfAbsent("currentUser", task.assignee());
            contextVariables.putIfAbsent("userId", task.assignee());
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

        List<HistoricTaskResponse> tasks = response.data()
                .stream()
                .sorted(HISTORIC_TASK_COMPARATOR)
                .toList();

        // Batch lookup de nombres de asignados para evitar consultas N+1 en DB
        Map<String, String> assigneeNamesMap = resolverNombresAsignadosBatch(tasks);

        List<WorkflowHistoryItemResponse> items = tasks.stream()
                .map(task -> {
                    String assigneeKey = task.assignee() != null ? task.assignee().trim() : null;
                    String assigneeName = assigneeKey != null ? assigneeNamesMap.getOrDefault(assigneeKey, assigneeKey) : null;
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

    private Map<String, String> resolverNombresAsignadosBatch(List<HistoricTaskResponse> tasks) {
        Map<String, String> result = new java.util.HashMap<>();
        if (tasks == null || tasks.isEmpty()) {
            return result;
        }

        java.util.Set<UUID> uuids = new java.util.HashSet<>();
        for (HistoricTaskResponse t : tasks) {
            if (t.assignee() != null && !t.assignee().isBlank()) {
                String trimmed = t.assignee().trim();
                try {
                    uuids.add(UUID.fromString(trimmed));
                } catch (IllegalArgumentException ignored) {
                    result.put(trimmed, trimmed);
                }
            }
        }

        if (uuids.isEmpty()) {
            return result;
        }

        // Buscar todos los empleados en una sola consulta
        List<com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado> empleados = empleadoRepository.findAllById(uuids);
        Map<UUID, com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado> empMap = empleados.stream()
                .collect(java.util.stream.Collectors.toMap(
                        com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado::getId,
                        e -> e,
                        (e1, e2) -> e1
                ));

        java.util.Set<UUID> personaIds = new java.util.HashSet<>();
        for (var emp : empleados) {
            if (emp.getPersonaId() != null) {
                personaIds.add(emp.getPersonaId());
            }
        }
        for (UUID uid : uuids) {
            if (!empMap.containsKey(uid)) {
                personaIds.add(uid);
            }
        }

        Map<UUID, String> personaNamesMap = new java.util.HashMap<>();
        if (!personaIds.isEmpty()) {
            List<com.endecorani.sigma_api.modules.organizacion.domain.model.Persona> personas = personaRepository.findAllById(personaIds);
            for (var p : personas) {
                if (p.getId() != null && p.getNombreCompleto() != null) {
                    personaNamesMap.put(p.getId(), p.getNombreCompleto());
                }
            }
        }

        for (UUID uid : uuids) {
            String key = uid.toString();
            if (empMap.containsKey(uid)) {
                var emp = empMap.get(uid);
                String nombrePersona = emp.getPersonaId() != null ? personaNamesMap.get(emp.getPersonaId()) : null;
                if (nombrePersona != null && !nombrePersona.isBlank()) {
                    result.put(key, nombrePersona + (emp.getCodigo() != null ? " [" + emp.getCodigo() + "]" : ""));
                } else if (emp.getCodigo() != null) {
                    result.put(key, "Empleado " + emp.getCodigo());
                } else {
                    result.put(key, key);
                }
            } else if (personaNamesMap.containsKey(uid)) {
                result.put(key, personaNamesMap.get(uid));
            } else {
                result.put(key, key);
            }
        }

        return result;
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

        // Registrar comentario en la auditoría nativa de Flowable si se envió alguno
        for (String commentKey : List.of("comentario", "observacion", "observacionAprobacion", "observacionValidacion", "observacionCierre", "motivo", "razon", "justificacion")) {
            Object commentVal = variables.get(commentKey);
            if (commentVal != null && !commentVal.toString().isBlank()) {
                flowableClient.agregarComentarioTarea(taskId, commentVal.toString().trim());
                break;
            }
        }

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

        String baseName = resourceName.replaceAll("(\\.bpmn20\\.xml|\\.bpmn|\\.xml)$", "");
        String[] possiblePaths = {
                "/processes/" + resourceName,
                "/processes/" + baseName + ".bpmn20.xml",
                "/processes/" + baseName + ".bpmn",
                "/processes/" + baseName + ".xml",
                resourceName.startsWith("/") ? resourceName : "/" + resourceName
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