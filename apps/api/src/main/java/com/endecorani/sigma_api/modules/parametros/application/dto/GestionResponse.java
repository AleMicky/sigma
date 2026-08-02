package com.endecorani.sigma_api.modules.parametros.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "GestionResponse",
        description = "Información de una gestión"
)
public record GestionResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Año de la gestión",
                example = "2026"
        )
        Integer gestion,

        @Schema(
                description = "Fecha de inicio de la gestión",
                example = "2026-01-01"
        )
        LocalDate fechaInicio,

        @Schema(
                description = "Fecha de fin de la gestión",
                example = "2026-12-31"
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
