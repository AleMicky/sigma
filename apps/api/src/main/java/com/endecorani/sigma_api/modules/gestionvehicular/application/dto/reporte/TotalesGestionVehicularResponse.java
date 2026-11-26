package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.reporte;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * REQ-VEH-009: totales agregados en servidor, calculados sobre TODAS las filas
 * que cumplen los filtros (no sobre la página actual ni sobre un máximo de filas).
 */
public record TotalesGestionVehicularResponse(
        long totalRegistros,
        BigDecimal totalLitros,
        BigDecimal totalImporte,
        long totalKm,
        LocalDateTime fechaDesde,
        LocalDateTime fechaHasta
) {
}
