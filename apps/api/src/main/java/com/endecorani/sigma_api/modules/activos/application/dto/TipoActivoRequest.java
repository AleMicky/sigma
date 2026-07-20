package com.endecorani.sigma_api.modules.activos.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(
        name = "TipoActivoRequest",
        description = "Datos necesarios para registrar o actualizar un tipo de activo"
)
public record TipoActivoRequest (
        @Schema(
                description = "Nombre del tipo de activo",
                example = "Vehículo",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del tipo de activo es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción del tipo de activo",
                example = "Vehículos utilizados por la institución"
        )
        @Size(
                max = 255,
                message = "La descripción no puede superar los 255 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Indica si el tipo de activo está habilitado",
                example = "true"
        )
        Boolean activo
) {
}
