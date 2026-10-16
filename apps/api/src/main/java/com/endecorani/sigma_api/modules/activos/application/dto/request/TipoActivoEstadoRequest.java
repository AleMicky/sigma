package com.endecorani.sigma_api.modules.activos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(
        name = "TipoActivoEstadoRequest",
        description = "Datos necesarios para asociar o actualizar un estado operativo a un tipo de activo"
)
public record TipoActivoEstadoRequest(
        @Schema(
                description = "Identificador del tipo de activo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tipo de activo es obligatorio")
        UUID tipoActivoId,

        @Schema(
                description = "Identificador del estado operativo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El estado operativo es obligatorio")
        UUID estadoOperativoId,

        @Schema(
                description = "Indica si es el estado operativo predeterminado para el tipo de activo",
                example = "false"
        )
        Boolean predeterminado
) {
    public TipoActivoEstadoRequest {
        if (predeterminado == null) {
            predeterminado = false;
        }
    }
}
