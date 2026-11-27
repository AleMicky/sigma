package com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client;

import com.endecorani.sigma_api.config.keycloak.KeycloakProperties;
import com.endecorani.sigma_api.config.keycloak.KeycloakTokenClient;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.dto.KeycloakRolResponse;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.dto.KeycloakUsuarioResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class KeycloakUsuarioClient {

    private static final int PAGE_SIZE = 100;

    private final RestClient keycloakRestClient;
    private final KeycloakProperties properties;
    private final KeycloakTokenClient tokenClient;

    public List<KeycloakUsuarioResponse> obtenerTodos() {
        String token = resolveAccessToken();
        List<KeycloakUsuarioResponse> todosLosUsuarios = new ArrayList<>();
        int first = 0;

        try {
            while (true) {
                final int currentFirst = first;
                var lote = keycloakRestClient.get()
                        .uri(properties.adminUsersUrl() + "?first=" + currentFirst + "&max=" + PAGE_SIZE)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .retrieve()
                        .body(new ParameterizedTypeReference<List<KeycloakUsuarioResponse>>() {});

                if (lote == null || lote.isEmpty()) {
                    break;
                }

                todosLosUsuarios.addAll(lote);

                // Si el lote recibido es menor al tamaño de página solicitado, ya no hay más usuarios
                if (lote.size() < PAGE_SIZE) {
                    break;
                }

                first += PAGE_SIZE;
            }

            return todosLosUsuarios;
        } catch (RestClientResponseException ex) {
            throw KeycloakAdminApiSupport.mapResponseError(ex, "obtener usuarios");
        } catch (BusinessException ex) {
            throw ex;
        } catch (ResourceAccessException ex) {
            throw KeycloakAdminApiSupport.mapNetworkError(ex, "obtener usuarios");
        } catch (Exception ex) {
            throw KeycloakAdminApiSupport.mapUnexpectedError(ex, "obtener usuarios");
        }
    }

    /**
     * REQ-SEG-002: una respuesta sin roles es legítima (lista vacía), pero un fallo de la
     * consulta (401/500/timeout) debe fallar cerrado: nunca se traduce en "sin roles",
     * porque eso desactivaría todos los roles locales del usuario.
     */
    public List<KeycloakRolResponse> obtenerRolesDeUsuario(String keycloakUserId) {
        String token = resolveAccessToken();

        try {
            var roles = keycloakRestClient.get()
                    .uri(properties.adminUserRealmRolesUrl(keycloakUserId))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<KeycloakRolResponse>>() {});

            return roles == null ? List.of() : roles;
        } catch (RestClientResponseException ex) {
            throw KeycloakAdminApiSupport.mapResponseError(ex, "obtener roles del usuario " + keycloakUserId);
        } catch (BusinessException ex) {
            throw ex;
        } catch (ResourceAccessException ex) {
            throw KeycloakAdminApiSupport.mapNetworkError(ex, "obtener roles del usuario " + keycloakUserId);
        } catch (Exception ex) {
            throw KeycloakAdminApiSupport.mapUnexpectedError(ex, "obtener roles del usuario " + keycloakUserId);
        }
    }

    /**
     * REQ-SEG-006: nunca se reutiliza el JWT del usuario autenticado para la Admin API;
     * siempre se usa el token de cuenta de servicio (client_credentials).
     */
    private String resolveAccessToken() {
        return KeycloakAdminApiSupport.serviceAccountToken(tokenClient);
    }
}
