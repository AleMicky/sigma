package com.endecorani.sigma_api.modules.parametros.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "PeriodoRequest",
        description = "Datos necesarios para actualizar un período"
)
public record PeriodoRequest(
        @Schema(
                description = "Identificador de la gestión a la que pertenece",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La gestión es obligatoria")
        UUID gestionId,

        @Schema(
                description = "Número del período (1-12)",
                example = "1",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El período es obligatorio")
        @Min(value = 1, message = "El período debe estar entre 1 y 12")
        @Max(value = 12, message = "El período debe estar entre 1 y 12")
        Integer periodo,

        @Schema(
                description = "Nombre literal del período",
                example = "Enero",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El literal del período es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El literal debe tener entre 2 y 50 caracteres"
        )
        String literal,

        @Schema(
                description = "Fecha de inicio del período",
                example = "2026-01-01",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate fechaInicio,

        @Schema(
                description = "Fecha de fin del período",
                example = "2026-01-31",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La fecha de fin es obligatoria")
        LocalDate fechaFin
) {
}
