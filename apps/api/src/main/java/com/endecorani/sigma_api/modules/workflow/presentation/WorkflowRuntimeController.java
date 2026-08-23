package com.endecorani.sigma_api.modules.workflow.presentation;

import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowApplicationService;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/workflow")
@RequiredArgsConstructor
public class WorkflowRuntimeController {

    private final WorkflowApplicationService workflowApplicationService;

    @GetMapping("/instances/{processInstanceId}/current-task")
    public WorkflowTaskResponse obtenerTareaActual(
            @PathVariable String processInstanceId
    ) {
        return workflowApplicationService
                .obtenerTareaActual(
                        processInstanceId
                );
    }

    @GetMapping(
            "/instances/{processInstanceId}/actions"
    )
    public WorkflowTaskActionsResponse obtenerAcciones(
            @PathVariable String processInstanceId
    ) {
        return workflowApplicationService
                .obtenerAccionesDisponibles(
                        processInstanceId
                );
    }
}