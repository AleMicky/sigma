package com.endecorani.sigma_api.modules.parametros.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "PeriodoResponse",
        description = "Información de un período"
)
public record PeriodoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Identificador de la gestión",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID gestionId,

        @Schema(
                description = "Número del período (1-12)",
                example = "1"
        )
        Integer periodo,

        @Schema(
                description = "Nombre literal del período",
                example = "Enero"
        )
        String literal,

        @Schema(
                description = "Fecha de inicio del período",
                example = "2026-01-01"
        )
        LocalDate fechaInicio,

        @Schema(
                description = "Fecha de fin del período",
                example = "2026-01-31"
        )
        LocalDate fechaFin,

        @Schema(description = "Fecha de creación")
        Instant createdAt,

        @Schema(description = "Fecha de última actualización")
        Instant updatedAt,

        @Schema(description = "Usuario que creó el registro")
        String createdBy,

        @Schema(description = "Usuario que actualizó el registro")
        String updatedBy
) {
}
