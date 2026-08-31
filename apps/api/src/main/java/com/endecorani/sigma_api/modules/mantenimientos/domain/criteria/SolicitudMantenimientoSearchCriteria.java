package com.endecorani.sigma_api.modules.mantenimientos.domain.criteria;

import java.util.UUID;

public record SolicitudMantenimientoSearchCriteria(
        String query,
        String estado,
        UUID solicitanteId,
        UUID responsableId,
        UUID supervisorId,
        UUID activoId,
        UUID prioridadId
) {
    public SolicitudMantenimientoSearchCriteria(String query) {
        this(query, null, null, null, null, null, null);
    }
}
