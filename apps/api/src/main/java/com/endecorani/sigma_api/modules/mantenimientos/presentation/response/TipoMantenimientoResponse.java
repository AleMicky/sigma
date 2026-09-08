package com.endecorani.sigma_api.modules.mantenimientos.presentation.response;

import java.util.UUID;

public record TipoMantenimientoResponse(
        UUID id,
        String codigo,
        String nombre,
        String descripcion
) {
}