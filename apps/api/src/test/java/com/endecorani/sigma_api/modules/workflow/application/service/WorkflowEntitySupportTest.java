package com.endecorani.sigma_api.modules.workflow.application.service;

import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowActionResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class WorkflowEntitySupportTest {

    @Mock
    private WorkflowApplicationService workflowApplicationService;

    @InjectMocks
    private WorkflowEntitySupport support;

    private WorkflowTaskActionsResponse tareaConDosAcciones() {
        return new WorkflowTaskActionsResponse(
                "task-1",
                "Revisión de Salida",
                "revisarSalida",
                "proc-1",
                "ACTIVE",
                List.of(),
                List.of(
                        new WorkflowActionResponse("Aprobar Salida", "action", "APROBAR"),
                        new WorkflowActionResponse("Rechazar Salida", "action", "RECHAZAR")
                )
        );
    }

    @Test
    void resolverAccionCoincidente_porValueExacto_debeRetornarAccionSolicitada() {
        WorkflowActionResponse result = support.resolverAccionCoincidente(tareaConDosAcciones(), "RECHAZAR");

        assertNotNull(result);
        assertEquals("RECHAZAR", result.value());
        assertEquals("Rechazar Salida", result.name());
    }

    @Test
    void resolverAccionCoincidente_porName_debeRetornarAccionSolicitada() {
        WorkflowActionResponse result = support.resolverAccionCoincidente(tareaConDosAcciones(), "rechazar salida");

        assertNotNull(result);
        assertEquals("RECHAZAR", result.value());
    }

    @Test
    void resolverAccionCoincidente_cuandoEnvianVariableEnLugarDeValue_debeLanzarBusinessException422() {
        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> support.resolverAccionCoincidente(tareaConDosAcciones(), "action")
        );

        assertEquals("INVALID_WORKFLOW_ACTION", ex.getCode());
        assertTrue(ex.getMessage().contains("action"));
        assertTrue(ex.getMessage().contains("APROBAR"));
        assertTrue(ex.getMessage().contains("RECHAZAR"));
    }

    @Test
    void resolverAccionCoincidente_cuandoAccionNoExiste_debeLanzarBusinessException422() {
        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> support.resolverAccionCoincidente(tareaConDosAcciones(), "ACCION_INEXISTENTE")
        );

        assertEquals("INVALID_WORKFLOW_ACTION", ex.getCode());
    }

    @Test
    void resolverAccionCoincidente_cuandoAccionBlancaConMultiplesAcciones_debeLanzarBusinessException() {
        assertThrows(
                BusinessException.class,
                () -> support.resolverAccionCoincidente(tareaConDosAcciones(), "  ")
        );
    }

    @Test
    void resolverAccionCoincidente_cuandoAccionBlancaConUnicaAccion_debeRetornarUnicaAccion() {
        WorkflowTaskActionsResponse tareaUnica = new WorkflowTaskActionsResponse(
                "task-2",
                "Registrar Llegada",
                "registrarLlegada",
                "proc-2",
                "ACTIVE",
                List.of(),
                List.of(new WorkflowActionResponse("Registrar Llegada", "action", "LLEGADA"))
        );

        WorkflowActionResponse result = support.resolverAccionCoincidente(tareaUnica, "");

        assertNotNull(result);
        assertEquals("LLEGADA", result.value());
    }
}
