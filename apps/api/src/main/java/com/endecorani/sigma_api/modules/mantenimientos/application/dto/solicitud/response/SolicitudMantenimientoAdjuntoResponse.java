package com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response;

import java.util.UUID;

public record SolicitudMantenimientoAdjuntoResponse(
        UUID id,
        String nombreArchivo,
        String url,
        String tipoContenido,
        Long size,
        String descripcion
) {
}
