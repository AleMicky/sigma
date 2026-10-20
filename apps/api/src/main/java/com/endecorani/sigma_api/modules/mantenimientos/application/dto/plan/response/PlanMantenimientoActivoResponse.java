package com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.time.LocalDate;
import java.util.UUID;

public record PlanMantenimientoActivoResponse(
        UUID id,
        UUID planMantenimientoId,
        PlanInfo plan,
        UUID activoId,
        ActivoInfo activo,
        UUID responsableId,
        ResponsableInfo responsable,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        Boolean estadoActivo,
        AuditoriaResponse auditoria
) {
    public record PlanInfo(
            UUID id,
            String codigo,
            String nombre,
            UUID tipoActivoId,
            String tipoActivoNombre
    ) {}

    public record ActivoInfo(
            UUID id,
            String codigo,
            String nombre,
            String descripcion,
            UUID tipoActivoId,
            String tipoActivoNombre
    ) {}

    public record ResponsableInfo(
            UUID id,
            String codigo,
            String nombreCompleto
    ) {}
}
