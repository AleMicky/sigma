package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record ReporteVehiculoKilometrajeResponse(
        UUID activoId,
        String activoCodigo,
        String placa,
        String marca,
        String modelo,
        String activoDescripcion,
        long cantidadSalidas,
        BigDecimal kilometrajeInicial,
        BigDecimal kilometrajeFinal,
        BigDecimal kilometrajeTotalRecorrido
) {
}
