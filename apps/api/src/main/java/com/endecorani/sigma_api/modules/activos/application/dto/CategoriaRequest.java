package com.endecorani.sigma_api.modules.activos.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(
        name = "CategoriaRequest",
        description = "Datos necesarios para registrar o actualizar una categoría de activos"
)
public record CategoriaRequest(
        @Schema(
                description = "Código único de la categoría",
                example = "INFRAESTRUCTURA",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código de la categoría es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El código debe tener entre 2 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre de la categoría",
                example = "Infraestructura",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre de la categoría es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción de la categoría",
                example = "Activos de infraestructura institucional"
        )
        @Size(
                max = 255,
                message = "La descripción no puede superar los 255 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Orden de visualización",
                example = "1"
        )
        @Min(value = 0, message = "El orden no puede ser negativo")
        Integer orden
) {
}
