package com.endecorani.sigma_api.config.keycloak;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.keycloak")
public record KeycloakProperties(
        String tokenUrl,
        String clientId,
        String clientSecret,
        String audience
) {
}
