package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.enums.DocumentoEstadoFilter;

import java.time.LocalDate;
import java.util.UUID;

public record ActivoDocumentoSearchCriteria(
        UUID activoId,
        UUID tipoDocumentoId,
        String query,
        DocumentoEstadoFilter estado,
        LocalDate fechaReferencia
) {
    public ActivoDocumentoSearchCriteria(UUID activoId, UUID tipoDocumentoId, String query) {
        this(activoId, tipoDocumentoId, query, null, null);
    }

    public ActivoDocumentoSearchCriteria withEstado(
            DocumentoEstadoFilter estado,
            LocalDate fechaReferencia
    ) {
        return new ActivoDocumentoSearchCriteria(
                activoId,
                tipoDocumentoId,
                query,
                estado,
                fechaReferencia
        );
    }
}
