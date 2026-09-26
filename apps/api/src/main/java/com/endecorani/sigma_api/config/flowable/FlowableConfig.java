package com.endecorani.sigma_api.config.flowable;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
@EnableConfigurationProperties(FlowableProperties.class)
public class FlowableConfig {

    @Bean("flowableRestClient")
    public RestClient flowableRestClient(
            FlowableProperties properties
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofSeconds(30));

        return RestClient.builder()
                .baseUrl(properties.baseUrl())
                .requestFactory(requestFactory)
                .defaultHeaders(headers ->
                        headers.setBasicAuth(
                                properties.username(),
                                properties.password()
                        )
                )
                .build();
    }
}