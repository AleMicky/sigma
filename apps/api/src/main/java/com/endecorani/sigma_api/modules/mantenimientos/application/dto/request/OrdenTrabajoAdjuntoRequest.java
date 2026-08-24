package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(
        name = "OrdenTrabajoAdjuntoRequest",
        description = "Datos necesarios para registrar un adjunto de orden de trabajo"
)
public record OrdenTrabajoAdjuntoRequest(
        @Schema(
                description = "Descripción del archivo",
                example = "Reporte de diagnóstico del equipo"
        )
        @Size(
                max = 500,
                message = "La descripción no puede superar los 500 caracteres"
        )
        String descripcion
) {
}
