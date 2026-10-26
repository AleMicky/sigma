package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request;

import java.math.BigDecimal;
import java.util.Map;

public record EjecutarAccionSalidaRequest(
        BigDecimal kilometraje,
        BigDecimal latitud,
        BigDecimal longitud,
        String observacion,
        Map<String, Object> variables
) {
}
