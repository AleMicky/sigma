package com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request;

import java.util.Map;

public record EjecutarAccionIncidenteRequest(
        Boolean aprobado,
        String observacionRevision,
        String detalleAtencion,
        Boolean solucionAprobada,
        String observacionValidacion,
        String observacionCierre,
        String observacion,
        Map<String, Object> variables
) {
}

