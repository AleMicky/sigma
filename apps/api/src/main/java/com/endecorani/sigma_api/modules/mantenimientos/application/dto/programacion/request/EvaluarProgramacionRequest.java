package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EvaluarProgramacionRequest(
        LocalDate fechaActual,
        BigDecimal kilometrajeActual,
        BigDecimal horasUsoActual,
        Boolean forzarGeneracion
) {
}
