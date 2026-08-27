package com.endecorani.sigma_api.modules.seguridad.application.dto.response;

public record KeycloakRolResponse(
        String id,
        String name,
        String description,
        boolean composite,
        boolean clientRole,
        String containerId

) {

}