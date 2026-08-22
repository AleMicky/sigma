package com.endecorani.sigma_api.modules.workflow.infrastructure.flowable;

import com.endecorani.sigma_api.modules.workflow.application.dto.request.StartProcessRequest;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.ProcessInstanceResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.FlowablePageResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.ProcessDefinitionResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.dto.TaskResponse;
import com.endecorani.sigma_api.modules.workflow.infrastructure.flowable.exception.FlowableIntegrationException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class FlowableClient {

    private final RestClient restClient;

    public FlowableClient(@Qualifier("flowableRestClient") RestClient restClient) {
        this.restClient = restClient;
    }

    public FlowablePageResponse<ProcessDefinitionResponse> obtenerProcesos() {
        try {
            return restClient.get().uri("/repository/process-definitions").retrieve().body(new org.springframework.core.ParameterizedTypeReference<>() {
            });

        } catch (RestClientResponseException ex) {
            throw new FlowableIntegrationException("Error consultando definiciones de procesos en Flowable", ex);
        }
    }

    public ProcessInstanceResponse iniciarProceso(StartProcessRequest request) {
        return restClient.post().uri("/runtime/process-instances").body(request).retrieve().body(ProcessInstanceResponse.class);
    }

    public FlowablePageResponse<TaskResponse> obtenerTareasPorProceso(String processInstanceId) {
        return restClient.get().uri(uriBuilder -> uriBuilder.path("/runtime/tasks").queryParam("processInstanceId", processInstanceId).build()).retrieve().body(new ParameterizedTypeReference<>() {
        });
    }

}