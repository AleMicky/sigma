package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.response;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record BitacoraVehicularResumenResponse(
        Integer totalViajes,
        Integer totalCargasCombustible,
        Long kmSalidaInicial,
        Long kmRetornoFinal,
        Long totalKmRecorridos,
        BigDecimal totalLitrosCombustible,
        BigDecimal totalImporteCombustible,
        BigDecimal rendimientoKmPorLitro,
        BigDecimal costoPromedioPorKm
) {
}
