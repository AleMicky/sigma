package com.endecorani.sigma_api.modules.activos.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "DocumentosRequest",
        description = "Datos necesarios para registrar o actualizar un documento de un activo"
)
public record DocumentosRequest(
        @Schema(
                description = "Identificador del activo al que pertenece el documento",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El activo es obligatorio")
        UUID activoId,

        @Schema(
                description = "Identificador del tipo de documento",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tipo de documento es obligatorio")
        UUID tipoDocumentoId,

        @Schema(
                description = "Nombre descriptivo del documento",
                example = "Factura de compra Toyota Hilux",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del documento es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción del documento",
                example = "Factura original de la adquisición del activo"
        )
        @Size(
                max = 255,
                message = "La descripción no puede superar los 255 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Fecha del documento",
                example = "2024-01-15"
        )
        LocalDate fechaDocumento,

        @Schema(
                description = "Fecha de vencimiento del documento. Obligatorio si el tipo de documento requiere vencimiento.",
                example = "2025-01-15"
        )
        LocalDate fechaVencimiento
) {
}