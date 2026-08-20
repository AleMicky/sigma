package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "SolicitudMantenimientoAdjuntoRequest",
        description = "Datos necesarios para registrar un adjunto de solicitud de mantenimiento"
)
public record SolicitudMantenimientoAdjuntoRequest(
        @Schema(
                description = "Identificador de la solicitud de mantenimiento",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(
                message =
                        "El identificador de la solicitud es obligatorio"
        )
        UUID solicitudMantenimientoId,

        @Schema(
                description = "Nombre del archivo",
                example = "foto_motor.jpg",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del archivo es obligatorio")
        @Size(
                min = 1,
                max = 255,
                message =
                        "El nombre del archivo debe tener entre 1 y 255 caracteres"
        )
        String nombreArchivo,

        @Schema(
                description = "Tipo de contenido MIME",
                example = "image/jpeg",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El tipo de contenido es obligatorio")
        @Size(
                min = 1,
                max = 100,
                message =
                        "El tipo de contenido debe tener entre 1 y 100 caracteres"
        )
        String tipoContenido,

        @Schema(
                description = "Tamaño del archivo en bytes",
                example = "1024000",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tamaño del archivo es obligatorio")
        Long size,

        @Schema(
                description = "URL del archivo",
                example = "https://storage.example.com/adjuntos/foto_motor.jpg",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "La URL es obligatoria")
        @Size(
                min = 1,
                max = 1000,
                message = "La URL debe tener entre 1 y 1000 caracteres"
        )
        String url,

        @Schema(
                description = "Descripción del archivo",
                example = "Foto del motor principal con daño visible"
        )
        @Size(
                max = 500,
                message =
                        "La descripción no puede superar los 500 caracteres"
        )
        String descripcion
) {
}
