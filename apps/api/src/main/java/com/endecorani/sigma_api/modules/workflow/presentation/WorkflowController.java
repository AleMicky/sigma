package com.endecorani.sigma_api.modules.workflow.presentation;

import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.FlowableClient;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/workflow")
@RequiredArgsConstructor
public class WorkflowController {

    private final FlowableClient flowableClient;

    @GetMapping("/process-definitions")
    public Object obtenerProcesos() {
        return flowableClient.obtenerProcesos();
    }
}