package com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.UUID;

public record TipoMantenimientoResponse(
        UUID id,
        String codigo,
        String nombre,
        String descripcion,
        AuditoriaResponse auditoria
) {
}
