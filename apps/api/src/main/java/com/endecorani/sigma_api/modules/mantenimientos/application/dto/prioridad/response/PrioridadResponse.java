package com.endecorani.sigma_api.modules.mantenimientos.application.dto.prioridad.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.UUID;

public record PrioridadResponse(
        UUID id,
        String codigo,
        String nombre,
        String descripcion,
        Integer nivel,
        Boolean porDefecto,
        AuditoriaResponse auditoria
) {
}