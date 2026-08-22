package com.endecorani.sigma_api.modules.organizacion.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "CargoResponse",
        description = "Información de un cargo"
)
public record CargoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código del cargo",
                example = "ANALISTA"
        )
        String codigo,

        @Schema(
                description = "Nombre del cargo",
                example = "Analista de Sistemas"
        )
        String nombre,

        @Schema(
                description = "Descripción del cargo",
                example = "Cargo encargado del análisis de requerimientos"
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