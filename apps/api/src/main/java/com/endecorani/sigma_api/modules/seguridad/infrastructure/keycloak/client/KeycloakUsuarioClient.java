package com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client;

import com.endecorani.sigma_api.config.keycloak.KeycloakProperties;
import com.endecorani.sigma_api.config.keycloak.KeycloakTokenClient;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.dto.KeycloakUsuarioResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class KeycloakUsuarioClient {

    private final RestClient keycloakRestClient;
    private final KeycloakProperties properties;
    private final KeycloakTokenClient tokenClient;

    public List<KeycloakUsuarioResponse> obtenerTodos() {
        try {
            var token = tokenClient.clientCredentialsGrant();

            var usuarios = keycloakRestClient.get()
                    .uri(properties.adminUsersUrl())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token.accessToken())
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<KeycloakUsuarioResponse>>() {});

            return usuarios == null ? List.of() : usuarios;
        } catch (RestClientResponseException ex) {
            log.error("Error al obtener usuarios desde Keycloak Admin API (status={}): {}",
                    ex.getStatusCode().value(), ex.getResponseBodyAsString());
            throw new BusinessException(
                    "KEYCLOAK_SYNC_ERROR",
                    "Error al sincronizar con Keycloak (" + ex.getStatusCode().value() + "): " +
                    (ex.getResponseBodyAsString().isBlank() ? ex.getStatusText() : ex.getResponseBodyAsString())
            );
        } catch (Exception ex) {
            log.error("Error inesperado al conectar con Keycloak", ex);
            throw new BusinessException(
                    "KEYCLOAK_SYNC_ERROR",
                    "No se pudo sincronizar con Keycloak: " + ex.getMessage()
            );
        }
    }
}
