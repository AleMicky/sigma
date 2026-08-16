package com.endecorani.sigma_api.modules.organizacion.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "EmpleadoResponse",
        description = "Información de un empleado con datos enriquecidos de persona, área y cargo"
)
public record EmpleadoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Identificador de la persona asociada",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID personaId,

        @Schema(
                description = "Nombre completo de la persona asociada",
                example = "Juan Carlos Pérez Gómez"
        )
        String personaNombreCompleto,

        @Schema(
                description = "Número de documento de la persona",
                example = "1234567"
        )
        String personaDocumento,

        @Schema(
                description = "Identificador del área",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID areaId,

        @Schema(
                description = "Nombre del área",
                example = "Operaciones y Mantenimiento"
        )
        String areaNombre,

        @Schema(
                description = "Identificador del cargo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID cargoId,

        @Schema(
                description = "Nombre del cargo",
                example = "Supervisor de Mantenimiento"
        )
        String cargoNombre,

        @Schema(
                description = "Código del empleado",
                example = "EMP-001"
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