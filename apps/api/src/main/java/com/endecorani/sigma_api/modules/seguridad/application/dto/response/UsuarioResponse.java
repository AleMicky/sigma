package com.endecorani.sigma_api.modules.seguridad.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.List;
import java.util.UUID;

public record UsuarioResponse(
        UUID id,
        String keycloakUserId,
        String username,
        String nombre,
        String email,
        boolean activo,
        List<String> roles,
        AuditoriaResponse auditoria
) {
}
