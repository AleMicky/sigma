package com.endecorani.sigma_api.modules.activos.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "TipoActivoEstadoResponse",
        description = "Información de la relación entre tipo de activo y estado operativo"
)
public record TipoActivoEstadoResponse(
        @Schema(
                description = "Identificador único de la relación",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Identificador del tipo de activo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID tipoActivoId,

        @Schema(
                description = "Identificador del estado operativo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID estadoOperativoId,

        @Schema(
                description = "Indica si es el estado operativo predeterminado",
                example = "false"
        )
        Boolean predeterminado,

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
