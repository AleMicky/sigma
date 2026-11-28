package com.endecorani.sigma_api.modules.cuestionarios.application.dto.response;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.TipoPregunta;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record PreguntaResponse(
        UUID id,
        String seccion,
        Integer orden,
        String enunciado,
        String descripcionAyuda,
        TipoPregunta tipoPregunta,
        Boolean obligatoria,
        BigDecimal peso,
        Map<String, Object> configJson,
        Boolean activo,
        List<PreguntaOpcionResponse> opciones
) {}
