package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoControlActivo;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(
        name = "ControlActivoRequest",
        description = "Datos necesarios para registrar o actualizar un control de activo"
)
public record ControlActivoRequest(
        @Schema(
                description = "ID de la solicitud de mantenimiento",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El ID de la solicitud de mantenimiento es obligatorio")
        UUID solicitudMantenimientoId,

        @Schema(
                description = "ID de la orden de trabajo"
        )
        UUID ordenTrabajoId,

        @Schema(
                description = "ID del activo",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El ID del activo es obligatorio")
        UUID activoId,

        @Schema(
                description = "Tipo de control de activo",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tipo de control es obligatorio")
        TipoControlActivo tipo,

        @Schema(
                description = "ID de la persona que entrega"
        )
        UUID entregadoPorId,

        @Schema(
                description = "ID de la persona que recibe"
        )
        UUID recibidoPorId,

        @Schema(
                description = "Fecha del control",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La fecha es obligatoria")
        LocalDateTime fecha,

        @Schema(
                description = "Indica si el control es conforme",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El campo conforme es obligatorio")
        Boolean conforme,

        @Schema(
                description = "Observación del control"
        )
        @Size(
                max = 500,
                message = "La observación no puede superar los 500 caracteres"
        )
        String observacion
) {
}
