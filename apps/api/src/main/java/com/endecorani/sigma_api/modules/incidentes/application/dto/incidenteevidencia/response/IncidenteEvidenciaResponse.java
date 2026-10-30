package com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteevidencia.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import lombok.Builder;

import java.util.UUID;

@Builder
public record IncidenteEvidenciaResponse(
        UUID id,
        UUID incidenteActivoId,
        String nombreArchivo,
        String url,
        String mimeType,
        Long size,
        AuditoriaResponse auditoria
) {
}

