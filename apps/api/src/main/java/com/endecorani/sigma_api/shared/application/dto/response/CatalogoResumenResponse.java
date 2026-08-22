package com.endecorani.sigma_api.shared.application.dto.response;

import java.util.UUID;

public record CatalogoResumenResponse(
        UUID id,
        String codigo,
        String nombre
) {
}