package com.endecorani.sigma_api.modules.parametros.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

@Schema(
        name = "GestionRequest",
        description = "Datos necesarios para registrar o actualizar una gestión"
)
public record GestionRequest(
        @Schema(
                description = "Año de la gestión",
                example = "2026",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La gestión es obligatoria")
        @Min(value = 2000, message = "La gestión debe ser mayor o igual a 2000")
        @Max(value = 2100, message = "La gestión debe ser menor o igual a 2100")
        Integer gestion,

        @Schema(
                description = "Fecha de inicio de la gestión",
                example = "2026-01-01",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate fechaInicio,

        @Schema(
                description = "Fecha de fin de la gestión",
                example = "2026-12-31",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La fecha de fin es obligatoria")
        LocalDate fechaFin
) {
}
