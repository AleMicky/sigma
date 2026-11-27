package com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.EstadoPlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.math.BigDecimal;
import java.util.UUID;

public record PlanMantenimientoResponse(
        UUID id,
        UUID tipoActivoId,
        String tipoActivoNombre,
        UUID tipoMantenimientoId,
        String codigo,
        String nombre,
        String descripcion,
        EstadoPlanMantenimiento estado,
        TipoCriterioMantenimiento criterioDefaultTipo,
        Integer criterioDefaultDias,
        BigDecimal criterioDefaultUso,
        Integer totalActividades,
        AuditoriaResponse auditoria
) {
}
