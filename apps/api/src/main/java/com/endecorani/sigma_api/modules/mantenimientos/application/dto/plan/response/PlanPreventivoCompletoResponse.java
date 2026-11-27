package com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.EstadoPlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record PlanPreventivoCompletoResponse(
        PlanMantenimientoResponse plan,
        EstadoPlanMantenimiento estado,
        UUID tipoMantenimientoId,
        TipoCriterioMantenimiento criterioDefaultTipo,
        Integer criterioDefaultDias,
        BigDecimal criterioDefaultUso,
        List<ActividadItemResponse> actividades,
        List<ActivoItemResponse> activos
) {
    public record ActividadItemResponse(
            UUID id,
            UUID actividadMantenimientoAplicacionId,
            Integer orden,
            Boolean obligatorio
    ) {
    }

    public record CriterioItemResponse(
            UUID id,
            TipoCriterioMantenimiento tipoCriterio,
            Integer intervaloDias,
            BigDecimal intervaloUso,
            LocalDate proximaFecha,
            BigDecimal proximoValorUso,
            Boolean activo
    ) {
    }

    public record ActivoItemResponse(
            UUID planMantenimientoActivoId,
            UUID programacionMantenimientoId,
            UUID activoId,
            UUID responsableId,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            Boolean activo,
            List<CriterioItemResponse> criterios
    ) {
    }
}
