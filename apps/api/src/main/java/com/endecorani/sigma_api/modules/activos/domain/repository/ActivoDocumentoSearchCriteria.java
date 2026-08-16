package com.endecorani.sigma_api.modules.activos.domain.repository;

import java.util.UUID;

public record ActivoDocumentoSearchCriteria(
        UUID activoId,
        UUID tipoDocumentoId,
        String query
) {
}
