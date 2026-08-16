package com.endecorani.sigma_api.modules.activos.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Schema(description = "Datos de respuesta de un documento de activo")
public record ActivoDocumentoResponse(
        @Schema(description = "ID del documento", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID id,

        @Schema(description = "ID del activo", example = "123e4567-e89b-12d3-a456-426614174001")
        UUID activoId,

        @Schema(description = "ID del tipo de documento", example = "123e4567-e89b-12d3-a456-426614174002")
        UUID tipoDocumentoId,

        @Schema(description = "Número del documento", example = "DOC-2023-001")
        String numeroDocumento,

        @Schema(description = "Nombre del documento", example = "Manual de usuario")
        String nombre,

        @Schema(description = "Descripción del documento")
        String descripcion,

        @Schema(description = "Fecha de emisión", example = "2023-01-01")
        LocalDate fechaEmision,

        @Schema(description = "Fecha de vencimiento", example = "2024-01-01")
        LocalDate fechaVencimiento,

        @Schema(description = "Nombre del archivo físico guardado", example = "documento-xyz.pdf")
        String nombreArchivo,

        @Schema(description = "URL pública o ruta para acceder al archivo")
        String rutaArchivo,

        @Schema(description = "Tipo MIME del archivo", example = "application/pdf")
        String mimeType,

        @Schema(description = "Tamaño del archivo en bytes", example = "1048576")
        Long size,

        @Schema(description = "Fecha de creación del registro")
        Instant createdAt,

        @Schema(description = "Fecha de la última actualización del registro")
        Instant updatedAt,

        @Schema(description = "Usuario que creó el registro")
        String createdBy,

        @Schema(description = "Usuario que realizó la última actualización")
        String updatedBy
) {
}
