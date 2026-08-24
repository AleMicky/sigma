package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "OrdenTrabajoAdjuntoResponse",
        description = "Información de un adjunto de orden de trabajo"
)
public record OrdenTrabajoAdjuntoResponse(
        UUID id,
        OrdenTrabajoInfo ordenTrabajo,
        String nombreArchivo,
        String tipoMime,
        Long tamanio,
        String url,
        String descripcion,
        AuditoriaResponse auditoria
) {
    public record OrdenTrabajoInfo(
            UUID id,
            String numero
    ) {
    }
}
