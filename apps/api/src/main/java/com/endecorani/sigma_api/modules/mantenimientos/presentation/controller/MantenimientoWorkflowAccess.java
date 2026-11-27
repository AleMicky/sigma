package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * REQ-MANT-028: distingue las transiciones de aprobación del resto de acciones del workflow.
 *
 * <p>Web envía {@code [action.variable]: action.value} ({@code WorkflowActionDialog.tsx:325-327});
 * en el BPMN de mantenimientos la aprobación se decide con {@code decisionCoordinador=APROBAR}
 * o {@code decisionSupervisor=VALIDAR}. Las acciones del propio solicitante (p. ej. asignar
 * aprobador en {@code borradorSolicitud}) no se consideran aprobación.</p>
 */
@Component("mantenimientoWorkflowAccess")
public class MantenimientoWorkflowAccess {

    public boolean esAprobacion(CompleteWorkflowTaskRequest request) {
        if (request == null || request.variables() == null) {
            return false;
        }
        Map<String, Object> variables = request.variables();
        return esValor(variables.get("decisionCoordinador"), "APROBAR")
                || esValor(variables.get("decisionSupervisor"), "VALIDAR")
                || esValor(variables.get("action"), "APROBAR", "VALIDAR")
                || esValor(variables.get("accion"), "APROBAR", "VALIDAR");
    }

    private boolean esValor(Object value, String... esperados) {
        if (value == null) {
            return false;
        }
        String actual = value.toString().trim().toUpperCase();
        for (String esperado : esperados) {
            if (actual.contains(esperado)) {
                return true;
            }
        }
        return false;
    }
}
