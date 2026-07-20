package com.endecorani.sigma_api.modules.auth.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(
        name = "AuthUserResponse",
        description = "Información del usuario autenticado"
)
public record AuthUserResponse(
        @Schema(
                description = "Identificador único del usuario (sub del JWT)",
                example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        )
        String id,

        @Schema(
                description = "Nombre de usuario",
                example = "admin"
        )
        String username,

        @Schema(
                description = "Nombre completo",
                example = "Administrador Sigma"
        )
        String name,

        @Schema(
                description = "Correo electrónico",
                example = "admin@endecorani.com"
        )
        String email,

        @Schema(
                description = "Roles del realm en Keycloak",
                example = "[\"ADMIN\"]"
        )
        List<String> roles
) {
}
