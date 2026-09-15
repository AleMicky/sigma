package com.endecorani.sigma_api.modules.mantenimientos.domain.criteria;

import java.util.UUID;

public record SolicitudMantenimientoSearchCriteria(
        String q,
        String estado,
        UUID solicitanteId,
        UUID responsableId,
        UUID supervisorId,
        UUID activoId,
        UUID aprobadorId
) {
}
