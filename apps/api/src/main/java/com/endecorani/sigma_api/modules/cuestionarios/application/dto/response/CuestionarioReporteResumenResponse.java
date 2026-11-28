package com.endecorani.sigma_api.modules.cuestionarios.application.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CuestionarioReporteResumenResponse(
        UUID cuestionarioId,
        String cuestionarioNombre,
        Boolean anonimoEnReportes,
        long totalAsignadas,
        long totalRespondidas,
        long totalPendientes,
        BigDecimal tasaParticipacion,
        BigDecimal promedioPuntaje,
        BigDecimal promedioPorcentaje,
        List<ReportePorPreguntaResponse> porPregunta,
        List<ReportePorEvaluadoResponse> porEvaluado
) {}
