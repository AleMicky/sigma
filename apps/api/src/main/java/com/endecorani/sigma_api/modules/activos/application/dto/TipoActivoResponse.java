package com.endecorani.sigma_api.modules.activos.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "TipoActivoResponse",
        description = "Información de un tipo de activo"
)
public record TipoActivoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Nombre del tipo de activo",
                example = "Vehículo"
        )
        String nombre,

        @Schema(
                description = "Descripción",
                example = "Vehículos utilizados por la institución"
        )
        String descripcion,

        @Schema(
                description = "Color hexadecimal del tipo (#RRGGBB)",
                example = "#2563EB"
        )
        String color,

        @Schema(
                description = "Nombre del icono Lucide",
                example = "Car"
        )
        String icono,

        @Schema(description = "Fecha de creación")
        Instant createdAt,

        @Schema(description = "Fecha de última actualización")
        Instant updatedAt,

        @Schema(
                description = "Usuario que creó el registro"
        )
        String createdBy,

        @Schema(
                description = "Usuario que actualizó el registro"
        )
        String updatedBy
) {
}
