package com.endecorani.sigma_api.modules.activos.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "TipoActivoRequest",
        description = "Datos necesarios para registrar o actualizar un tipo de activo"
)
public record TipoActivoRequest(
        @Schema(
                description = "Identificador de la categoría a la que pertenece",
                example = "a1b2c3d4-e5f6-4011-8001-000000000001",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La categoría es obligatoria")
        UUID categoriaId,

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
                description = "Color hexadecimal del tipo (#RRGGBB)",
                example = "#2563EB"
        )
        @Pattern(
                regexp = "^$|^#(?:[0-9A-Fa-f]{6})$",
                message = "El color debe tener el formato #RRGGBB"
        )
        @Size(max = 7, message = "El color no puede superar 7 caracteres")
        String color,

        @Schema(
                description = "Nombre del icono Lucide",
                example = "Car"
        )
        @Pattern(
                regexp = "^$|^[A-Za-z][A-Za-z0-9]*$",
                message = "El icono debe ser un nombre Lucide válido"
        )
        @Size(max = 50, message = "El icono no puede superar 50 caracteres")
        String icono
) {
}
