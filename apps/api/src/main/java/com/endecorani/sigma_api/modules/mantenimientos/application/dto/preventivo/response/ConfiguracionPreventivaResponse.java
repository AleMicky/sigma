package com.endecorani.sigma_api.modules.mantenimientos.application.dto.preventivo.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.math.BigDecimal;
import java.util.UUID;

public record ConfiguracionPreventivaResponse(
        UUID id,
        Integer diasAnticipacionAlerta,
        BigDecimal kmAnticipacionAlerta,
        BigDecimal horasAnticipacionAlerta,
        Boolean evaluacionAutomaticaHabilitada,
        String cronEvaluacion,
        AuditoriaResponse auditoria
) {
}
