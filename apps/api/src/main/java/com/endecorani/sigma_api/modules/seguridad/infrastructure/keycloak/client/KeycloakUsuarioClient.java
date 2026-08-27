package com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client;


import com.endecorani.sigma_api.config.keycloak.KeycloakProperties;
import com.endecorani.sigma_api.config.keycloak.KeycloakTokenClient;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.dto.KeycloakUsuarioResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
@RequiredArgsConstructor
public class KeycloakUsuarioClient {

    private final RestClient keycloakRestClient;
    private final KeycloakProperties properties;
    private final KeycloakTokenClient tokenClient;

    public List<KeycloakUsuarioResponse> obtenerTodos() {

        var token = tokenClient.clientCredentialsGrant();

        var usuarios = keycloakRestClient.get()
                .uri(properties.adminUsersUrl())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token.accessToken())
                .retrieve()
                .body(new ParameterizedTypeReference<List<KeycloakUsuarioResponse>>() {
                      }
                );

        return usuarios == null ? List.of() : usuarios;

    }

}
