package com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client;

import com.endecorani.sigma_api.config.keycloak.KeycloakProperties;
import com.endecorani.sigma_api.config.keycloak.KeycloakTokenClient;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.dto.KeycloakRolResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class KeycloakRolClient {

    private final RestClient keycloakRestClient;
    private final KeycloakProperties properties;
    private final KeycloakTokenClient tokenClient;

    public List<KeycloakRolResponse> obtenerTodos() {
        String token = resolveAccessToken();

        try {
            var roles = keycloakRestClient.get()
                    .uri(properties.adminRolesUrl())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<KeycloakRolResponse>>() {});

            return roles == null ? List.of() : roles;
        } catch (RestClientResponseException ex) {
            log.error("Error al obtener roles desde Keycloak Admin API (status={}): {}",
                    ex.getStatusCode().value(), ex.getResponseBodyAsString());
            throw new BusinessException(
                    "KEYCLOAK_SYNC_ERROR",
                    "Error al sincronizar roles con Keycloak (" + ex.getStatusCode().value() + "): " +
                    (ex.getResponseBodyAsString().isBlank() ? ex.getStatusText() : ex.getResponseBodyAsString())
            );
        } catch (BusinessException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error inesperado al conectar con Keycloak para obtener roles", ex);
            throw new BusinessException(
                    "KEYCLOAK_SYNC_ERROR",
                    "No se pudo sincronizar roles con Keycloak: " + ex.getMessage()
            );
        }
    }

    private String resolveAccessToken() {
        // 1. Intentar con el token del usuario actualmente autenticado (admin)
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            String userToken = jwt.getTokenValue();
            if (userToken != null && !userToken.isBlank()) {
                log.debug("Usando token de usuario autenticado para consultar Keycloak Admin API (roles)");
                return userToken;
            }
        }

        // 2. Si no hay contexto de usuario, usar client_credentials grant
        try {
            var clientToken = tokenClient.clientCredentialsGrant();
            return clientToken.accessToken();
        } catch (Exception ex) {
            log.warn("Fallo al obtener token por client_credentials: {}", ex.getMessage());
            throw new BusinessException(
                    "KEYCLOAK_SYNC_AUTH_ERROR",
                    "No se pudo autenticar con Keycloak. " +
                    "Habilita 'Service accounts roles' en el client '" + properties.clientId() + "' de Keycloak o asigna el rol 'view-realm' / 'query-groups' / 'realm-admin' al usuario."
            );
        }
    }
}
