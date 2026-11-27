package com.endecorani.sigma_api.modules.mantenimientos.application.dto.preventivo.response;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PreventivoHistorialItemResponse(
        UUID id,
        UUID programacionMantenimientoId,
        UUID planMantenimientoId,
        String planCodigo,
        String planNombre,
        UUID activoId,
        String activoCodigo,
        String activoNombre,
        UUID solicitudMantenimientoId,
        String solicitudNumero,
        UUID ordenTrabajoId,
        TipoCriterioMantenimiento tipoCriterioDisparador,
        String valorDisparador,
        String valorLimite,
        LocalDateTime fechaDisparo,
        Boolean completado,
        LocalDate fechaServicio,
        BigDecimal valorUsoServicio,
        String observacion
) {
}
