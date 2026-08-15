package com.endecorani.sigma_api.modules.inventarios.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "InsumoResponse",
        description = "Información de un insumo"
)
public record InsumoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código del insumo",
                example = "INS-001"
        )
        String codigo,

        @Schema(
                description = "Nombre del insumo",
                example = "Cemento Portland"
        )
        String nombre,

        @Schema(
                description = "Descripción",
                example = "Cemento para construcción general"
        )
        String descripcion,

        @Schema(
                description = "ID del tipo de insumo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID tipoInsumoId,

        @Schema(
                description = "ID de la categoría de insumo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID categoriaInsumoId,

        @Schema(
                description = "ID de la unidad de medida",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID unidadMedidaId,

        @Schema(
                description = "Marca del insumo",
                example = "Cemex"
        )
        String marca,

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
