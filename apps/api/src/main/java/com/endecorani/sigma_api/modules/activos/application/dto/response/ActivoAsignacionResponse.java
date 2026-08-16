package com.endecorani.sigma_api.modules.activos.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Datos de respuesta de una asignación de activo")
public record ActivoAsignacionResponse(
        @Schema(description = "ID de la asignación", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID id,

        @Schema(description = "ID del activo", example = "123e4567-e89b-12d3-a456-426614174001")
        UUID activoId,

        @Schema(description = "ID del empleado", example = "123e4567-e89b-12d3-a456-426614174002")
        UUID empleadoId,

        @Schema(description = "ID del área", example = "123e4567-e89b-12d3-a456-426614174003")
        UUID areaId,

        @Schema(description = "Fecha de asignación", example = "2023-01-01T10:00:00")
        LocalDateTime fechaAsignacion,

        @Schema(description = "Fecha de devolución", example = "2023-12-31T10:00:00")
        LocalDateTime fechaDevolucion,

        @Schema(description = "Observación de la asignación")
        String observacionAsignacion,

        @Schema(description = "Observación de la devolución")
        String observacionDevolucion,

        @Schema(description = "Fecha de creación del registro")
        Instant createdAt,

        @Schema(description = "Fecha de la última actualización del registro")
        Instant updatedAt,

        @Schema(description = "Usuario que creó el registro")
        String createdBy,

        @Schema(description = "Usuario que realizó la última actualización")
        String updatedBy
) {
}
