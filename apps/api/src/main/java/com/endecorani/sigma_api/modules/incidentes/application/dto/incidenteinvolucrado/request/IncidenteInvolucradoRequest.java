package com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteinvolucrado.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

import java.util.UUID;

@Builder
public record IncidenteInvolucradoRequest(
        @NotBlank(message = "El tipo de involucrado es obligatorio")
        String tipoInvolucrado,
        UUID empleadoId,
        String nombre,
        String documentoIdentidad,
        String descripcion
) {
}

