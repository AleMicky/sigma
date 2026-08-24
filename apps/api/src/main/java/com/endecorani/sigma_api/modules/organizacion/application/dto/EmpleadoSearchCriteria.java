package com.endecorani.sigma_api.modules.organizacion.domain.repository;

import java.util.UUID;

public record EmpleadoSearchCriteria(
        UUID personaId,
        UUID areaId,
        UUID cargoId,
        String query
) {
}
