package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(
        name = "SolicitudMantenimientoAdjuntoRequest",
        description = "Datos necesarios para registrar un adjunto de solicitud de mantenimiento"
)
public record SolicitudMantenimientoAdjuntoRequest(
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
