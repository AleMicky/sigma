package com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response;

import java.util.UUID;

public record OrdenTrabajoActividadEvidenciaResponse(
        UUID id,
        UUID ordenTrabajoActividadId,
        String nombreArchivo,
        String tipoMime,
        Long tamanio,
        String url
) {
}
