package com.endecorani.sigma_api.modules.inventarios.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "TipoInsumoAtributoResponse",
        description = "Información de un atributo de tipo de insumo"
)
public record TipoInsumoAtributoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Identificador del tipo de dato",
                example = "a1b2c3d4-e5f6-4011-8001-000000000008"
        )
        UUID tipoDatoId,

        @Schema(
                description = "Identificador del tipo de insumo",
                example = "a1b2c3d4-e5f6-4012-8003-000000000001"
        )
        UUID tipoInsumoId,

        @Schema(
                description = "Código del atributo",
                example = "MARCA"
        )
        String codigo,

        @Schema(
                description = "Nombre del atributo",
                example = "Marca"
        )
        String nombre,

        @Schema(
                description = "Indica si el atributo es obligatorio",
                example = "true"
        )
        Boolean requerido,

        @Schema(
                description = "Orden de visualización",
                example = "1"
        )
        Integer orden,

        @Schema(
                description = "Opciones configuradas en formato JSON para el atributo",
                example = "[\"Opción 1\", \"Opción 2\"]"
        )
        String opciones,

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
