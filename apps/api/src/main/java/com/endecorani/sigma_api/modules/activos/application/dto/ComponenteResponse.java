package com.endecorani.sigma_api.modules.activos.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "ComponenteResponse",
        description = "Información de un componente de tipo de activo"
)
public record ComponenteResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Identificador del tipo de activo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID tipoActivoId,

        @Schema(
                description = "Código del componente",
                example = "MOTOR"
        )
        String codigo,

        @Schema(
                description = "Nombre del componente",
                example = "Motor"
        )
        String nombre,

        @Schema(
                description = "Descripción",
                example = "Motor del vehículo"
        )
        String descripcion,

        @Schema(
                description = "Indica si el componente está activo",
                example = "true"
        )
        Boolean activo,

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
