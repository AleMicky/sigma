package com.endecorani.sigma_api.modules.workflow.application.service;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/** Verifica que la regla "sin tarea activa" sea un error de negocio controlado y no un 500 interno. */
@ExtendWith(MockitoExtension.class)
class WorkflowApplicationServiceTest {

    @Mock
    private WorkflowConfigService workflowConfigService;
    @Mock
    private WorkflowEngineService workflowEngineService;

    @InjectMocks
    private WorkflowApplicationService service;

    @Test
    void completarTarea_cuandoNoHayRespuestaDeTarea_debeLanzarBusinessException() {
        when(workflowEngineService.obtenerAccionesDisponibles("proc-1")).thenReturn(null);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.completarTarea("proc-1", new CompleteWorkflowTaskRequest(Map.of())));

        assertEquals("El proceso no tiene una tarea activa", ex.getMessage());
        verify(workflowEngineService, never()).completarTarea(anyString(), anyMap());
    }

    @Test
    void completarTarea_cuandoTaskIdEsNulo_debeLanzarBusinessException() {
        when(workflowEngineService.obtenerAccionesDisponibles("proc-2"))
                .thenReturn(new WorkflowTaskActionsResponse(
                        null, null, null, "proc-2", null, List.of(), List.of()));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.completarTarea("proc-2", new CompleteWorkflowTaskRequest(Map.of())));

        assertEquals("El proceso no tiene una tarea activa", ex.getMessage());
        verify(workflowEngineService, never()).completarTarea(anyString(), anyMap());
    }

    @Test
    void completarTarea_cuandoHayTareaActiva_debeCompletarYConsultarAccionesFinales() {
        WorkflowTaskActionsResponse tarea = new WorkflowTaskActionsResponse(
                "task-1", "Revisar", "revisar", "proc-3", "ACTIVO", List.of(), List.of());
        WorkflowTaskActionsResponse finales = new WorkflowTaskActionsResponse(
                null, null, null, "proc-3", "FINALIZADO", List.of(), List.of());
        when(workflowEngineService.obtenerAccionesDisponibles("proc-3"))
                .thenReturn(tarea, finales);

        WorkflowTaskActionsResponse resultado = service.completarTarea(
                "proc-3", new CompleteWorkflowTaskRequest(Map.of("accion", "aprobar")));

        assertEquals(finales, resultado);
        verify(workflowEngineService).completarTarea("task-1", Map.of("accion", "aprobar"));
    }
}
