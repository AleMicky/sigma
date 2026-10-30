package com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteinvolucrado.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import lombok.Builder;

import java.util.UUID;

@Builder
public record IncidenteInvolucradoResponse(
        UUID id,
        UUID incidenteActivoId,
        String tipoInvolucrado,
        UUID empleadoId,
        String nombre,
        String documentoIdentidad,
        String descripcion,
        AuditoriaResponse auditoria
) {
}

