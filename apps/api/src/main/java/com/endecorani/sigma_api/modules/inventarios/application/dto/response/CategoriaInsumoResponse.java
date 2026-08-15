package com.endecorani.sigma_api.modules.inventarios.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "CategoriaInsumoResponse",
        description = "Información de una categoría de insumo"
)
public record CategoriaInsumoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código de la categoría de insumo",
                example = "ALIMENTOS"
        )
        String codigo,

        @Schema(
                description = "Nombre de la categoría de insumo",
                example = "Alimentos"
        )
        String nombre,

        @Schema(
                description = "Descripción",
                example = "Insumos alimenticios"
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
