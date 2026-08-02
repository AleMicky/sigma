package com.endecorani.sigma_api.modules.auth.application.dto;

public record KeycloakTokenResponse(
        String accessToken,
        String refreshToken,
        Long expiresIn,
        Long refreshExpiresIn,
        String tokenType,
        String scope
) {
}
