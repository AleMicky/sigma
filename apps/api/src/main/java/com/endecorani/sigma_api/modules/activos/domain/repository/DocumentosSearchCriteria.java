package com.endecorani.sigma_api.modules.activos.domain.repository;

import java.util.UUID;

public record DocumentosSearchCriteria(
        UUID activoId,
        UUID tipoDocumentoId,
        String query
) {
}
