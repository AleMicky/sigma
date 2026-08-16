package com.endecorani.sigma_api.modules.activos.domain.repository;

import java.util.UUID;

public record ActivoAsignacionSearchCriteria(
        UUID activoId,
        String query
) {
}
