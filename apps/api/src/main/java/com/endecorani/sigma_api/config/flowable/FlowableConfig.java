package com.endecorani.sigma_api.config.flowable;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(FlowableProperties.class)
public class FlowableConfig {

    @Bean("flowableRestClient")
    public RestClient flowableRestClient(
            FlowableProperties properties
    ) {
        return RestClient.builder()
                .baseUrl(properties.baseUrl())
                .defaultHeaders(headers ->
                        headers.setBasicAuth(
                                properties.username(),
                                properties.password()
                        )
                )
                .build();
    }
}