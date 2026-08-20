package com.endecorani.sigma_api.modules.parametros.application.dto.response;

import java.util.UUID;

public record CorrelativoResponse(
        UUID id,
        String codigo,
        Integer gestion,
        Integer ultimoNumero,
        String prefijo,
        Integer longitud
) {
}
