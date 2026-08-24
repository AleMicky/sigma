package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(
        name = "OrdenTrabajoActividadRequest",
        description = "Datos necesarios para registrar o actualizar una actividad de orden de trabajo"
)
public record OrdenTrabajoActividadRequest(
        @Schema(
                description = "ID de la orden de trabajo",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El ID de la orden de trabajo es obligatorio")
        UUID ordenTrabajoId,

        @Schema(
                description = "ID de la actividad de mantenimiento (opcional, null si es correctivo)"
        )
        UUID actividadMantenimientoId,

        @Schema(
                description = "Descripción de la actividad",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "La descripción es obligatoria")
        @Size(
                max = 1000,
                message = "La descripción no puede superar los 1000 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Indica si la actividad fue realizada",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El campo realizado es obligatorio")
        Boolean realizado,

        @Schema(
                description = "Observación de la actividad"
        )
        @Size(
                max = 1500,
                message = "La observación no puede superar los 1500 caracteres"
        )
        String observacion,

        @Schema(
                description = "Fecha de realización de la actividad"
        )
        LocalDateTime fechaRealizacion
) {
}
