package com.endecorani.sigma_api.modules.mantenimientos.domain.criteria;

import java.util.List;
import java.util.UUID;

public record SolicitudMantenimientoSearchCriteria(
        String q,
        List<String> estados,
        UUID solicitanteId,
        UUID responsableId,
        UUID supervisorId,
        UUID activoId,
        UUID aprobadorId
) {
}
