package com.endecorani.sigma_api.modules.organizacion.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "EmpleadoRequest",
        description = "Datos necesarios para registrar o actualizar un empleado"
)
public record EmpleadoRequest(
        @Schema(
                description = "Identificador de la persona asociada",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La persona es obligatoria")
        UUID personaId,

        @Schema(
                description = "Identificador del área",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El área es obligatoria")
        UUID areaId,

        @Schema(
                description = "Identificador del cargo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El cargo es obligatorio")
        UUID cargoId,

        @Schema(
                description = "Código único del empleado",
                example = "EMP-001",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del empleado es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El código debe tener entre 2 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Fecha de inicio del empleado en el cargo",
                example = "2024-01-15"
        )
        LocalDate fechaInicio,

        @Schema(
                description = "Fecha de fin del empleado en el cargo",
                example = "2025-12-31"
        )
        LocalDate fechaFin
) {
}