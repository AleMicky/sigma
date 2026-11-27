package com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client;

import com.endecorani.sigma_api.config.keycloak.KeycloakProperties;
import com.endecorani.sigma_api.config.keycloak.KeycloakTokenClient;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.dto.KeycloakRolResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
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
                    .body(new ParameterizedTypeReference<List<KeycloakRolResponse>>() {
                    });

            return roles == null ? List.of() : roles;
        } catch (RestClientResponseException ex) {
            throw KeycloakAdminApiSupport.mapResponseError(ex, "obtener roles");
        } catch (BusinessException ex) {
            throw ex;
        } catch (ResourceAccessException ex) {
            throw KeycloakAdminApiSupport.mapNetworkError(ex, "obtener roles");
        } catch (Exception ex) {
            throw KeycloakAdminApiSupport.mapUnexpectedError(ex, "obtener roles");
        }
    }

    /**
     * REQ-SEG-006: la Admin API se invoca con la cuenta de servicio, nunca con el JWT del
     * administrador en sesión.
     */
    private String resolveAccessToken() {
        return KeycloakAdminApiSupport.serviceAccountToken(tokenClient);
    }
}
