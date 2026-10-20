package com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.UUID;

public record PlanMantenimientoActividadResponse(
        UUID id,
        UUID planMantenimientoId,
        UUID actividadMantenimientoAplicacionId,
        ActividadInfo actividad,
        TipoActivoInfo tipoActivo,
        ComponenteInfo componente,
        Integer orden,
        Boolean obligatorio,
        AuditoriaResponse auditoria
) {
    public record ActividadInfo(
            UUID id,
            String codigo,
            String nombre,
            String descripcion
    ) {}

    public record TipoActivoInfo(
            UUID id,
            String nombre
    ) {}

    public record ComponenteInfo(
            UUID id,
            String nombre
    ) {}
}
