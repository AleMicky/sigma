package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(
        name = "ActividadMantenimientoAplicacionRequest",
        description = "Datos necesarios para registrar o actualizar la aplicación de una actividad de mantenimiento a un tipo de activo"
)
public record ActividadMantenimientoAplicacionRequest(
        @Schema(
                description = "Identificador de la actividad de mantenimiento",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La actividad de mantenimiento es obligatoria")
        UUID actividadMantenimientoId,

        @Schema(
                description = "Identificador del tipo de activo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tipo de activo es obligatorio")
        UUID tipoActivoId,

        @Schema(
                description = "Identificador del componente (opcional)",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID componenteId
) {
}
