package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.FlowableVariableRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.StartProcessRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.ProcessInstanceResponse;
import com.endecorani.sigma_api.modules.workflow.application.service.WorkflowEngineService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FlowableWorkflowService implements WorkflowEngineService {

    private final FlowableClient flowableClient;

    @Override
    public String iniciarProceso(
            String processDefinitionKey,
            String businessKey,
            Map<String, Object> variables
    ) {

        List<FlowableVariableRequest> flowableVariables = variables.entrySet()
                        .stream()
                        .map(entry -> new FlowableVariableRequest(
                                        entry.getKey(),
                                        entry.getValue()
                                )
                        )
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
}