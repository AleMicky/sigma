package com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.time.LocalDateTime;
import java.util.UUID;

public record SolicitudMantenimientoResponse(
        UUID id,
        String numero,
        UUID activoId,
        UUID tipoMantenimientoId,
        UUID tipoFallaId,
        UUID prioridadId,
        UUID solicitanteId,
        String titulo,
        String descripcion,
        LocalDateTime fechaSolicitud,
        UUID aprobadorId,
        UUID responsableId,
        UUID supervisorId,
        LocalDateTime fechaInicioMantenimiento,
        LocalDateTime fechaFinMantenimiento,
        LocalDateTime fechaCierre,
        String processInstanceId,
        String estado,
        AuditoriaResponse auditoria
) {
}
