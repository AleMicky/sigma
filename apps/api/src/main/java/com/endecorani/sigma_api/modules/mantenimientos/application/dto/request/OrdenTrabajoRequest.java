package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(
        name = "OrdenTrabajoRequest",
        description = "Datos necesarios para registrar o actualizar una orden de trabajo"
)
public record OrdenTrabajoRequest(
        @Schema(
                description = "ID de la solicitud de mantenimiento",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El ID de la solicitud de mantenimiento es obligatorio")
        UUID solicitudMantenimientoId,

        @Schema(
                description = "ID del activo",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El ID del activo es obligatorio")
        UUID activoId,

        @Schema(
                description = "ID del empleado responsable",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El ID del responsable es obligatorio")
        UUID responsableId,

        @Schema(
                description = "Fecha de inicio de la orden de trabajo"
        )
        LocalDateTime fechaInicio,

        @Schema(
                description = "Fecha de fin de la orden de trabajo"
        )
        LocalDateTime fechaFin,

        @Schema(
                description = "Diagnóstico de la orden de trabajo"
        )
        @Size(
                max = 2000,
                message = "El diagnóstico no puede superar los 2000 caracteres"
        )
        String diagnostico,

        @Schema(
                description = "Trabajo realizado en la orden de trabajo"
        )
        @Size(
                max = 4000,
                message = "El trabajo realizado no puede superar los 4000 caracteres"
        )
        String trabajoRealizado,

        @Schema(
                description = "Observación de la orden de trabajo"
        )
        @Size(
                max = 2000,
                message = "La observación no puede superar los 2000 caracteres"
        )
        String observacion
) {
}
