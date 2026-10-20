package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CompletarMantenimientoProgramadoRequest(
        LocalDate fechaServicio,
        BigDecimal kilometrajeServicio,
        BigDecimal horasUsoServicio,
        UUID solicitudId,
        String observacion
) {
}
