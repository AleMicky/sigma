package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "SolicitudMantenimientoAdjuntoResponse",
        description = "Información de un adjunto de solicitud de mantenimiento"
)
public record SolicitudMantenimientoAdjuntoResponse(
        @Schema(description = "Identificador único")
        UUID id,

        @Schema(
                description = "Identificador de la solicitud de mantenimiento"
        )
        UUID solicitudMantenimientoId,

        @Schema(
                description = "Nombre del archivo",
                example = "foto_motor.jpg"
        )
        String nombreArchivo,

        @Schema(
                description = "Tipo de contenido MIME",
                example = "image/jpeg"
        )
        String tipoContenido,

        @Schema(
                description = "Tamaño del archivo en bytes",
                example = "1024000"
        )
        Long size,

        @Schema(
                description = "URL del archivo",
                example = "https://storage.example.com/adjuntos/foto_motor.jpg"
        )
        String url,

        @Schema(description = "Descripción del archivo")
        String descripcion,

        @Schema(description = "Datos de auditoría")
        AuditoriaResponse auditoria
) {
}
