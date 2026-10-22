package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response;

import java.util.List;

public record BatchEvaluacionProgramacionResponse(
        int totalEvaluadas,
        int solicitudesGeneradas,
        int yaExistiaSolicitudAbierta,
        int cumplieronCriterio,
        int errores,
        List<EvaluacionProgramacionResponse> evaluaciones
) {
}
