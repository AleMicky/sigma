package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.UUID;

public record SolicitudVehicularAdjuntoResponse(
        UUID id,
        UUID solicitudVehicularId,
        String nombreArchivo,
        String nombreOriginal,
        String url,
        String mimeType,
        Long size,
        String descripcion,
        AuditoriaResponse auditoria
) {
}
