package com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrdenTrabajoResponse(
        UUID id,
        String numero,
        UUID solicitudMantenimientoId,
        UUID activoId,
        UUID responsableId,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        String diagnostico,
        String trabajoRealizado,
        String observacion,
        List<OrdenTrabajoActividadResponse> actividades,
        List<OrdenTrabajoAdjuntoResponse> adjuntos,
        AuditoriaResponse auditoria
) {
}
