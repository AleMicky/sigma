package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ProgramacionMantenimientoResponse(
        UUID id,
        UUID planMantenimientoActivoId,
        PlanActivoInfo planActivo,
        Boolean activo,
        List<ProgramacionMantenimientoCriterioResponse> criterios,
        AuditoriaResponse auditoria
) {
    public record PlanActivoInfo(
            UUID id,
            UUID planMantenimientoId,
            String planCodigo,
            String planNombre,
            UUID activoId,
            String activoCodigo,
            String activoNombre,
            UUID tipoActivoId,
            String tipoActivoNombre,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            Boolean estadoActivo
    ) {}
}
