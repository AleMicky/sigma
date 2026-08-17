package com.endecorani.sigma_api.modules.activos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "ActivoAccesorioRequest",
        description = "Datos necesarios para registrar o actualizar un accesorio de un activo"
)
public record ActivoAccesorioRequest(
        @Schema(
                description = "Identificador del activo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El activo es obligatorio")
        UUID activoId,

        @Schema(
                description = "Identificador del accesorio",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El accesorio es obligatorio")
        UUID accesorioId,

        @Schema(
                description = "Cantidad del accesorio",
                example = "1",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser mayor a 0")
        Integer cantidad,

        @Schema(
                description = "Número de serie del accesorio",
                example = "SN-12345"
        )
        @Size(
                max = 100,
                message = "El número de serie no puede superar los 100 caracteres"
        )
        String numeroSerie,

        @Schema(
                description = "Observación del accesorio",
                example = "Accesorio instalado en la cabina"
        )
        @Size(
                max = 500,
                message = "La observación no puede superar los 500 caracteres"
        )
        String observacion
) {
}
