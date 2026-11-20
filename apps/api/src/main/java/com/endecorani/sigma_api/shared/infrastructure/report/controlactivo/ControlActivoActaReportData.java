package com.endecorani.sigma_api.shared.infrastructure.report.controlactivo;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record ControlActivoActaReportData(
        UUID controlId,
        boolean entrega,
        String tituloReporte,
        String numeroSolicitud,
        String tituloSolicitud,
        String activoCodigo,
        String activoNombre,
        LocalDateTime fechaActa,
        Boolean conforme,
        String entregadoPorNombre,
        String entregadoPorCargo,
        String recibidoPorNombre,
        String recibidoPorCargo,
        String observacionGeneral,
        String generadoPor,
        List<ControlActivoAccesorioReporteItem> accesorios
) {
}
