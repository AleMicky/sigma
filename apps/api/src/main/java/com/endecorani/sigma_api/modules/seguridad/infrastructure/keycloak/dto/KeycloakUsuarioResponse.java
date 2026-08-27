package com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.dto;

public record KeycloakUsuarioResponse(
        String id,
        String username,
        String firstName,
        String lastName,
        String email,
        boolean enabled
) {

}