package com.endecorani.sigma_api.modules.auth.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "AuthTokenResponse", description = "Tokens de sesión y usuario autenticado")
public record AuthTokenResponse(
        @Schema(
                description = "Access token JWT de Keycloak",
                example = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
        )
        String accessToken,

        @Schema(
                description = "Refresh token de Keycloak",
                example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        )
        String refreshToken,

        @Schema(description = "Segundos hasta la expiración del access token", example = "300")
        Long expiresIn,

        @Schema(description = "Tipo de token", example = "Bearer")
        String tokenType,

        @Schema(description = "Usuario autenticado")
        AuthUserResponse user
) {
}
