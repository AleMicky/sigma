package com.endecorani.sigma_api.modules.inventarios.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "TipoInsumoResponse",
        description = "Información de un tipo de insumo"
)
public record TipoInsumoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código del tipo de insumo",
                example = "MATERIA_PRIMA"
        )
        String codigo,

        @Schema(
                description = "Nombre del tipo de insumo",
                example = "Materia prima"
        )
        String nombre,

        @Schema(
                description = "Descripción",
                example = "Insumos utilizados como materia prima"
        )
        String descripcion,

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
