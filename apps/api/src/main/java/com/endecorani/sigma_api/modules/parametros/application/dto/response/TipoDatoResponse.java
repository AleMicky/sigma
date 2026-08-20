package com.endecorani.sigma_api.modules.parametros.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "TipoDatoResponse",
        description = "Información de un tipo de dato"
)
public record TipoDatoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código único del tipo de dato",
                example = "SELECT"
        )
        String codigo,

        @Schema(
                description = "Nombre del tipo de dato",
                example = "Selección"
        )
        String nombre,

        @Schema(
                description = "Descripción del tipo de dato",
                example = "Permite seleccionar una opción de un catálogo"
        )
        String descripcion,

        @Schema(
                description = "Indica si el tipo de dato admite opciones de catálogo",
                example = "true"
        )
        Boolean permiteOpciones,

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
