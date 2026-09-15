package com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response;

import java.util.UUID;

public record OrdenTrabajoAdjuntoResponse(
        UUID id,
        UUID ordenTrabajoId,
        String nombreArchivo,
        String tipoMime,
        Long tamanio,
        String url,
        String descripcion
) {
}
