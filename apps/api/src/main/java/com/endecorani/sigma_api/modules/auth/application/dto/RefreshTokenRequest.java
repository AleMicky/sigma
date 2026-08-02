package com.endecorani.sigma_api.modules.auth.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "RefreshTokenRequest", description = "Solicitud de renovación de token")
public record RefreshTokenRequest(
        @NotBlank(message = "El refresh token es obligatorio")
        @Schema(description = "Refresh token emitido por Keycloak")
        String refreshToken
) {
}
