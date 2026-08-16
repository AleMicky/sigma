package com.endecorani.sigma_api.modules.activos.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "ActivoResponse",
        description = "Información de un activo"
)
public record ActivoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código del activo",
                example = "VEH-001"
        )
        String codigo,

        @Schema(
                description = "Nombre del activo",
                example = "Toyota Hilux"
        )
        String nombre,

        @Schema(
                description = "Descripción",
                example = "Camioneta de operaciones"
        )
        String descripcion,

        @Schema(
                description = "Identificador del tipo de activo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID tipoActivoId,

        @Schema(
                description = "Identificador de la ubicación",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID ubicacionId,

        @Schema(
                description = "Fecha de adquisición",
                example = "2024-01-15"
        )
        LocalDate fechaAdquisicion,

        @Schema(
                description = "URL pública de la imagen",
                example = "/api/v1/files/activos/4e8236fc-6daa-4814-b7f7-a5d0d37383d8.jpg"
        )
        String urlImagen,

        @Schema(
                description = "Indica si el activo está activo",
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
