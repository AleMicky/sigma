package com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.UUID;

public record PlanMantenimientoResponse(
        UUID id,
        UUID tipoActivoId,
        String tipoActivoNombre,
        String codigo,
        String nombre,
        String descripcion,
        Integer totalActividades,
        AuditoriaResponse auditoria
) {
}
