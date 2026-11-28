package com.endecorani.sigma_api.modules.cuestionarios.application.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record ReportePorEvaluadoResponse(
        String evaluadoTipo,
        UUID evaluadoId,
        String evaluadoNombre,
        long totalEvaluaciones,
        BigDecimal promedioPuntaje,
        BigDecimal promedioPorcentaje
) {}
