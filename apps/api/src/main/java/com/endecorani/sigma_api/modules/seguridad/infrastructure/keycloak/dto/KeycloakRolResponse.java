package com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.dto;

public record KeycloakRolResponse(
        String id,
        String name,
        String description,
        boolean composite,
        boolean clientRole,
        String containerId

) {

}