package com.endecorani.sigma_api.modules.workflow.presentation;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.FlowableVariableRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.StartProcessRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.ProcessInstanceResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.FlowableClient;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.FlowablePageResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.TaskResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/workflow")
@RequiredArgsConstructor
public class WorkflowController {

    private final FlowableClient flowableClient;

    @GetMapping("/process-definitions")
    public Object obtenerProcesos() {
        return flowableClient.obtenerProcesos();
    }

    @PostMapping("/test-start")
    public ProcessInstanceResponse iniciarPrueba() {

        StartProcessRequest request = new StartProcessRequest("solicitudMantenimientoProcess", UUID.randomUUID().toString(), List.of(new FlowableVariableRequest("solicitanteId", UUID.randomUUID().toString())));

        return flowableClient.iniciarProceso(request);
    }

    @GetMapping("/test-tasks/{processInstanceId}")
    public FlowablePageResponse<TaskResponse> obtenerTareas(@PathVariable String processInstanceId) {
        return flowableClient.obtenerTareasPorProceso(processInstanceId);

    }
}