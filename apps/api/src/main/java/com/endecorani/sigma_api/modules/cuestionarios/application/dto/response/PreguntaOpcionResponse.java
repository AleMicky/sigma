package com.endecorani.sigma_api.modules.cuestionarios.application.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record PreguntaOpcionResponse(
        UUID id,
        Integer orden,
        String etiqueta,
        String valor,
        BigDecimal puntaje,
        Boolean activo
) {}
