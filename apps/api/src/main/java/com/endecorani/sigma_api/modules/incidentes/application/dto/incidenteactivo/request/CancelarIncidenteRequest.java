package com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request;

import jakarta.validation.constraints.Size;

public record CancelarIncidenteRequest(
        @Size(max = 1000, message = "El motivo de cancelación no puede exceder 1000 caracteres")
        String motivo
) {
}

