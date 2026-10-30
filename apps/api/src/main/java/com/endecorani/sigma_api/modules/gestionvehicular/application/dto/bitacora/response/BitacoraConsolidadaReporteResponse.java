package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record BitacoraConsolidadaReporteResponse(
        Integer totalRegistros,
        Integer totalSalidas,
        Integer totalSolicitudes,
        Long totalKmRecorridos,
        BigDecimal totalLitrosCombustible,
        List<BitacoraConsolidadaItemResponse> items
) {
}

