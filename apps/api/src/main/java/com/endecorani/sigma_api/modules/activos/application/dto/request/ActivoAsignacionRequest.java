package com.endecorani.sigma_api.modules.activos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Datos para crear o actualizar una asignación de activo")
public record ActivoAsignacionRequest(
        @NotNull(message = "El activo es requerido")
        @Schema(description = "ID del activo", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID activoId,

        @Schema(description = "ID del empleado al que se le asigna", example = "123e4567-e89b-12d3-a456-426614174001")
        UUID empleadoId,

        @Schema(description = "ID del área a la que se le asigna", example = "123e4567-e89b-12d3-a456-426614174002")
        UUID areaId,

        @NotNull(message = "La fecha de asignación es requerida")
        @Schema(description = "Fecha de asignación", example = "2023-01-01T10:00:00")
        LocalDateTime fechaAsignacion,

        @Schema(description = "Fecha de devolución", example = "2023-12-31T10:00:00")
        LocalDateTime fechaDevolucion,

        @Size(max = 500, message = "La observación de asignación no puede tener más de 500 caracteres")
        @Schema(description = "Observación de la asignación")
        String observacionAsignacion,

        @Size(max = 500, message = "La observación de devolución no puede tener más de 500 caracteres")
        @Schema(description = "Observación de la devolución")
        String observacionDevolucion
) {
}
