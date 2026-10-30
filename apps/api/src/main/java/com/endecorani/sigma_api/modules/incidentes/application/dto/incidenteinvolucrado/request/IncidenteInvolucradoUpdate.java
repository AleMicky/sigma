package com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteinvolucrado.request;

import lombok.Builder;

import java.util.UUID;

@Builder
public record IncidenteInvolucradoUpdate(
        String tipoInvolucrado,
        UUID empleadoId,
        String nombre,
        String documentoIdentidad,
        String descripcion
) {
}

