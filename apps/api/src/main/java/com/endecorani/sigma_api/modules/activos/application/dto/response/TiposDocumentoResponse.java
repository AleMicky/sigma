package com.endecorani.sigma_api.modules.activos.application.dto.response;


import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "TiposDocumentoResponse",
        description = "Información de tipo documento"
)
public record TiposDocumentoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código único de tipo de documento",
                example = "FACTURA"
        )
        String codigo,

        @Schema(
                description = "Nombre de tipo documento",
                example = "Factura de compra"
        )
        String nombre,

        @Schema(
                description = "Descripción de tipo documento",
                example = "Documento que acredita la compra del activo."
        )
        String descripcion,

        @Schema(
                description = "Indica si el tipo de documento requiere registrar fecha de vencimiento",
                example = "false"
        )
        Boolean requiereVencimiento,

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