package com.endecorani.sigma_api.modules.activos.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "EstadoOperativoResponse",
        description = "Información de un estado operativo de activos"
)
public record EstadoOperativoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código del estado operativo",
                example = "OPERATIVO"
        )
        String codigo,

        @Schema(
                description = "Nombre del estado operativo",
                example = "Operativo"
        )
        String nombre,

        @Schema(
                description = "Descripción",
                example = "Activo en condiciones normales de funcionamiento"
        )
        String descripcion,

        @Schema(
                description = "Color hexadecimal del estado (#RRGGBB)",
                example = "#10B981"
        )
        String color,

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
