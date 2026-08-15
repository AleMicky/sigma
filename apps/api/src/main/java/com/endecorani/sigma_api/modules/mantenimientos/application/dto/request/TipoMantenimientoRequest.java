package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(
        name = "TipoMantenimientoRequest",
        description = "Datos necesarios para registrar o actualizar un tipo de mantenimiento"
)
public record TipoMantenimientoRequest(
        @Schema(
                description = "Código único de tipo de mantenimiento",
                example = "PREVENTIVO",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del tipo de mantenimiento es obligatorio")
        @Size(
                min = 2,
                max = 30,
                message = "El código debe tener entre 2 y 30 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre de tipo de mantenimiento",
                example = "Mantenimiento preventivo",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del tipo de mantenimiento es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción de tipo de mantenimiento",
                example = "Mantenimiento programado para prevenir fallas."
        )
        @Size(
                max = 300,
                message = "La descripción no puede superar los 300 caracteres"
        )
        String descripcion
) {
}