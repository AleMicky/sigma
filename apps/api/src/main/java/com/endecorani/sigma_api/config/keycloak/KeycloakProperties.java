package com.endecorani.sigma_api.config.keycloak;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.keycloak")
public record KeycloakProperties(
        String baseUrl,
        String realm,
        String tokenUrl,
        String logoutUrl,
        String clientId,
        String clientSecret,
        String audience
) {

    public String resolvedBaseUrl() {
        if (baseUrl != null && !baseUrl.isBlank()) {
            return baseUrl;
        }
        if (tokenUrl != null && tokenUrl.contains("/realms/")) {
            return tokenUrl.substring(0, tokenUrl.indexOf("/realms/"));
        }
        return "http://157.173.99.216:8081";
    }

    public String resolvedRealm() {
        if (realm != null && !realm.isBlank()) {
            return realm;
        }
        if (tokenUrl != null && tokenUrl.contains("/realms/")) {
            String after = tokenUrl.substring(tokenUrl.indexOf("/realms/") + "/realms/".length());
            int nextSlash = after.indexOf("/");
            return nextSlash > 0 ? after.substring(0, nextSlash) : after;
        }
        return "sigma";
    }

    public String adminUsersUrl() {
        return "%s/admin/realms/%s/users".formatted(resolvedBaseUrl(), resolvedRealm());
    }

    public String adminRolesUrl() {
        return "%s/admin/realms/%s/roles".formatted(resolvedBaseUrl(), resolvedRealm());
    }

    public String adminUserRealmRolesUrl(String userId) {
        return "%s/admin/realms/%s/users/%s/role-mappings/realm".formatted(resolvedBaseUrl(), resolvedRealm(), userId);
    }

    public String resolvedLogoutUrl() {
        if (logoutUrl != null && !logoutUrl.isBlank()) {
            return logoutUrl;
        }

        if (tokenUrl != null && tokenUrl.endsWith("/token")) {
            return tokenUrl.substring(0, tokenUrl.length() - "/token".length()) + "/logout";
        }

        throw new IllegalStateException("Configura app.keycloak.logout-url o token-url");
    }
}