package com.endecorani.sigma_api.modules.auth.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "LoginRequest", description = "Credenciales de acceso")
public record LoginRequest(
        @NotBlank(message = "El usuario es obligatorio")
        @Schema(description = "Nombre de usuario", example = "admin")
        String username,

        @NotBlank(message = "La contraseña es obligatoria")
        @Schema(description = "Contraseña", example = "admin")
        String password
) {
}
