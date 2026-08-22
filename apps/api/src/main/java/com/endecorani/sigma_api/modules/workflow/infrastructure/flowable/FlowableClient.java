package com.endecorani.sigma_api.config.flowable;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class FlowableClient {

    private final RestClient flowableRestClient;

    public String obtenerProcesos() {
        return flowableRestClient
                .get()
                .uri("/repository/process-definitions")
                .retrieve()
                .body(String.class);
    }
}