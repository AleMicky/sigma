package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;

import java.util.UUID;

public record EvaluacionProgramacionResponse(
        UUID programacionId,
        boolean cumpleCriterio,
        TipoCriterioMantenimiento criterioCumplido,
        String motivoDisparo,
        boolean solicitudGenerada,
        boolean yaExistiaSolicitudAbierta,
        UUID solicitudMantenimientoId,
        String solicitudNumero,
        String mensaje
) {
}
