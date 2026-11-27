package com.endecorani.sigma_api.modules.workflow.application.service;

import com.endecorani.sigma_api.config.security.SecurityUtils;
import com.endecorani.sigma_api.modules.organizacion.application.service.EmpleadoInfoResolver;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ForbiddenException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REQ-MANT-027: guardia de actor para el completado genérico de tareas BPMN.
 *
 * <p>El servicio {@link WorkflowApplicationService} es compartido por varios dominios, por lo que
 * la validación estricta se aplica solo al proceso de mantenimientos. Los demás flujos conservan
 * su comportamiento actual y sus propios controladores con {@code @PreAuthorize}.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WorkflowCompletionGuard {

    public static final String MANTENIMIENTOS_DEFINITION_KEY = "solicitudMantenimientoProcess";

    private static final List<String> ACTOR_VARIABLES = List.of("solicitanteId", "actorId", "empleadoId");

    private final SecurityUtils securityUtils;
    private final EmpleadoInfoResolver empleadoInfoResolver;
    private final WorkflowEngineService workflowEngineService;

    public void validar(String processInstanceId, Map<String, Object> variables) {
        String definitionKey = workflowEngineService.obtenerDefinitionKey(processInstanceId);
        if (!MANTENIMIENTOS_DEFINITION_KEY.equalsIgnoreCase(definitionKey)) {
            return;
        }

        WorkflowTaskResponse tarea = workflowEngineService.obtenerTareaActual(processInstanceId);
        String assignee = tarea != null && tarea.assignee() != null ? tarea.assignee().trim() : null;
        if (assignee == null || assignee.isBlank()) {
            throw new ConflictException(
                    "TAREA_NO_ASIGNADA",
                    "La tarea activa no tiene un responsable asignado");
        }

        UUID actorId = empleadoInfoResolver.resolveCurrentEmpleadoId().orElse(null);

        if (securityUtils.isAdmin()) {
            // REQ-MANT-027: el bypass de ADMIN siempre queda registrado, nunca es silencioso.
            log.info("REQ-MANT-027 ADMIN bypass en workflow genérico: proceso {}, tarea {}, usuario {}, assignee {}",
                    processInstanceId,
                    tarea.id(),
                    securityUtils.getCurrentUsername(),
                    assignee);
            return;
        }

        validarActorDeclarado(variables, actorId);

        if (actorId == null) {
            throw new ForbiddenException("El usuario actual no está vinculado a un empleado para completar la tarea");
        }
        if (!actorId.toString().equalsIgnoreCase(assignee)) {
            throw new ForbiddenException("La tarea está asignada a otro usuario y no puede ser completada");
        }
    }

    private void validarActorDeclarado(Map<String, Object> variables, UUID actorId) {
        if (variables == null) {
            return;
        }
        for (String key : ACTOR_VARIABLES) {
            Object declarado = variables.get(key);
            if (declarado == null || declarado.toString().isBlank()) {
                continue;
            }
            if (actorId == null
                    || !actorId.toString().equalsIgnoreCase(declarado.toString().trim())) {
                throw new ForbiddenException("El " + key + " declarado no coincide con el usuario autenticado");
            }
        }
    }
}
