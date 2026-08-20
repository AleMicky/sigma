package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(
        name = "SolicitudMantenimientoResponse",
        description = "Información de una solicitud de mantenimiento"
)
public record SolicitudMantenimientoResponse(
        UUID id,
        String numero,
        ActivoInfo activo,
        TipoMantenimientoInfo tipoMantenimiento,
        String motivoMantenimiento,
        PrioridadInfo prioridad,
        UserInfo solicitante,
        String titulo,
        String descripcion,
        LocalDateTime fechaSolicitud,
        UserInfo aprobadoPor,
        LocalDateTime fechaAprobacion,
        String observacionAprobacion,
        UserInfo responsable,
        LocalDateTime fechaAsignacion,
        LocalDateTime fechaInicioMantenimiento,
        LocalDateTime fechaFinMantenimiento,
        UserInfo supervisor,
        LocalDateTime fechaValidacion,
        String observacionValidacion,
        LocalDateTime fechaFinalizacion,
        UserInfo recibidoPor,
        String observacionCierre,
        String estado,
        String processInstanceId,
        List<SolicitudMantenimientoAdjuntoResponse> adjuntos,
        AuditoriaResponse auditoria
) {
    public record ActivoInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }

    public record TipoMantenimientoInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }

    public record PrioridadInfo(
            UUID id,
            String codigo,
            String nombre,
            Integer nivel
    ) {
    }

    public record UserInfo(
            UUID id,
            String nombre
    ) {
    }

    public record AreaInfo(
            UUID id,
            String nombre
    ) {
    }
}
