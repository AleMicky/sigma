package com.endecorani.sigma_api.modules.cuestionarios.application.dto.response;

import java.math.BigDecimal;

public record DistribucionOpcionResponse(
        String etiqueta,
        long cantidad,
        BigDecimal porcentaje
) {}
