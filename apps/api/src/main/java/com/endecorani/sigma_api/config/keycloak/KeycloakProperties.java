package com.endecorani.sigma_api.config.keycloak;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.keycloak")
public record KeycloakProperties(
        String tokenUrl,
        String logoutUrl,
        String clientId,
        String clientSecret,
        String audience
) {
    public String resolvedLogoutUrl() {
        if (logoutUrl != null && !logoutUrl.isBlank()) {
            return logoutUrl;
        }
        if (tokenUrl != null && tokenUrl.endsWith("/token")) {
            return tokenUrl.substring(0, tokenUrl.length() - "/token".length()) + "/logout";
        }
        throw new IllegalStateException(
                "Configura app.keycloak.logout-url o un token-url que termine en /token"
        );
    }
}
