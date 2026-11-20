package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.vehiculo.response;

import java.util.UUID;

public record VehiculoAtributoResponse(
        UUID atributoId,
        String codigo,
        String etiqueta,
        String tipoDatoCodigo,
        Integer orden,
        Boolean visible,
        String valor,
        String valorFormateado
) {
}
