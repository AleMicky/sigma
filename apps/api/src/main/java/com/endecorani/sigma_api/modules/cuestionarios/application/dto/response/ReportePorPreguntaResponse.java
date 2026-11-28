package com.endecorani.sigma_api.modules.cuestionarios.application.dto.response;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.TipoPregunta;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ReportePorPreguntaResponse(
        UUID preguntaId,
        Integer orden,
        String seccion,
        String enunciado,
        TipoPregunta tipoPregunta,
        long totalRespuestas,
        BigDecimal promedioValor,
        BigDecimal promedioPuntaje,
        List<DistribucionOpcionResponse> distribucion
) {}
