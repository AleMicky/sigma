package com.endecorani.sigma_api.modules.auth.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "LogoutRequest", description = "Solicitud de cierre de sesión")
public record LogoutRequest(
        @NotBlank(message = "El refresh token es obligatorio")
        @Schema(description = "Refresh token a invalidar en Keycloak")
        String refreshToken
) {
}
