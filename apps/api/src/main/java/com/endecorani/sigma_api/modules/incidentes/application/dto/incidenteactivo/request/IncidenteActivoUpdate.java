package com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record IncidenteActivoUpdate(
        UUID activoId,
        String tipoIncidente,
        String prioridad,
        String estado,
        LocalDateTime fechaHora,
        String ubicacion,
        BigDecimal latitud,
        BigDecimal longitud,
        String descripcion,
        UUID empleadoReportaId
) {
}

