package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record ProgramacionMantenimientoHistorialResponse(
        UUID id,
        UUID programacionMantenimientoId,
        UUID solicitudMantenimientoId,
        String solicitudNumero,
        TipoCriterioMantenimiento tipoCriterioDisparador,
        String valorDisparador,
        String valorLimite,
        LocalDateTime fechaDisparo,
        String snapshotValores,
        Boolean completado,
        LocalDate fechaServicio,
        BigDecimal valorUsoServicio,
        String observacion,
        AuditoriaResponse auditoria
) {
}
