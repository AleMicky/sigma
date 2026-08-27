package com.endecorani.sigma_api.modules.seguridad.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.UUID;

public record RolResponse(
        UUID id,
        String keycloakRoleId,
        String codigo,
        String nombre,
        String descripcion,
        boolean activo,
        AuditoriaResponse auditoria
) {
}
