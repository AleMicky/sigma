package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "SolicitudMantenimientoAdjuntoResponse",
        description = "Información de un adjunto de solicitud de mantenimiento"
)
public record SolicitudMantenimientoAdjuntoResponse(
        UUID id,
        UUID solicitudMantenimientoId,
        String nombreArchivo,
        String tipoContenido,
        Long size,
        String url,
        String descripcion,
        AuditoriaResponse auditoria
) {
}
