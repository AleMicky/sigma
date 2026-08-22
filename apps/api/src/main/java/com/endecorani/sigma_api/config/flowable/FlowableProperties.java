package com.endecorani.sigma_api.config.flowable;


import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "flowable")
public record FlowableProperties(
        String baseUrl,
        String username,
        String password
) {
}