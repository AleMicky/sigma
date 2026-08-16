package com.endecorani.sigma_api.modules.activos.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "ActivoRequest",
        description = "Datos necesarios para registrar o actualizar un activo"
)
public record ActivoRequest(
        @Schema(
                description = "Código único del activo",
                example = "VEH-001",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del activo es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El código debe tener entre 2 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del activo",
                example = "Toyota Hilux",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del activo es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción del activo",
                example = "Camioneta de operaciones"
        )
        @Size(
                max = 255,
                message = "La descripción no puede superar los 255 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Identificador del tipo de activo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tipo de activo es obligatorio")
        UUID tipoActivoId,

        @Schema(
                description = "Identificador de la ubicación del activo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID ubicacionId,

        @Schema(
                description = "Fecha de adquisición",
                example = "2024-01-15"
        )
        LocalDate fechaAdquisicion
) {
}
