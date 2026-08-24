package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "ControlActivoDetalleRequest",
        description = "Datos necesarios para registrar o actualizar un detalle de control de activo"
)
public record ControlActivoDetalleRequest(
        @Schema(
                description = "ID del control de activo",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El ID del control de activo es obligatorio")
        UUID controlActivoId,

        @Schema(
                description = "ID del accesorio",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El ID del accesorio es obligatorio")
        UUID accesorioId,

        @Schema(
                description = "Cantidad esperada del accesorio",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La cantidad esperada es obligatoria")
        @Min(value = 0, message = "La cantidad esperada no puede ser negativa")
        Integer cantidadEsperada,

        @Schema(
                description = "Cantidad encontrada del accesorio",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La cantidad encontrada es obligatoria")
        @Min(value = 0, message = "La cantidad encontrada no puede ser negativa")
        Integer cantidadEncontrada,

        @Schema(
                description = "Indica si el detalle es conforme",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El campo conforme es obligatorio")
        Boolean conforme,

        @Schema(
                description = "Observación del detalle"
        )
        @Size(
                max = 300,
                message = "La observación no puede superar los 300 caracteres"
        )
        String observacion
) {
}
