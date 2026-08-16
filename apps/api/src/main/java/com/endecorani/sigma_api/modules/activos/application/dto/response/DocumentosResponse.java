package com.endecorani.sigma_api.modules.activos.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "DocumentosResponse",
        description = "Información de un documento de un activo"
)
public record DocumentosResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Identificador del activo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID activoId,

        @Schema(
                description = "Identificador del tipo de documento",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID tipoDocumentoId,

        @Schema(
                description = "Nombre del documento",
                example = "Factura de compra Toyota Hilux"
        )
        String nombre,

        @Schema(
                description = "Descripción del documento",
                example = "Factura original de la adquisición del activo"
        )
        String descripcion,

        @Schema(
                description = "Nombre original del archivo subido",
                example = "factura-hilux.pdf"
        )
        String nombreOriginal,

        @Schema(
                description = "Nombre del archivo almacenado",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8.pdf"
        )
        String nombreArchivo,

        @Schema(
                description = "URL pública del archivo",
                example = "/api/v1/files/documentos/4e8236fc-6daa-4814-b7f7-a5d0d37383d8.pdf"
        )
        String ruta,

        @Schema(
                description = "Extensión del archivo",
                example = "pdf"
        )
        String extension,

        @Schema(
                description = "MIME type del archivo",
                example = "application/pdf"
        )
        String mimeType,

        @Schema(
                description = "Tamaño del archivo en bytes",
                example = "204800"
        )
        Long tamanoBytes,

        @Schema(
                description = "Fecha del documento",
                example = "2024-01-15"
        )
        LocalDate fechaDocumento,

        @Schema(
                description = "Fecha de vencimiento del documento",
                example = "2025-01-15"
        )
        LocalDate fechaVencimiento,

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