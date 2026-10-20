package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ProgramacionMantenimientoCriterioResponse(
        UUID id,
        UUID programacionMantenimientoId,
        TipoCriterioMantenimiento tipoCriterio,
        Integer intervaloDias,
        BigDecimal intervaloUso,
        LocalDate proximaFecha,
        BigDecimal proximoValorUso,
        Boolean activo,
        AuditoriaResponse auditoria
) {
}
