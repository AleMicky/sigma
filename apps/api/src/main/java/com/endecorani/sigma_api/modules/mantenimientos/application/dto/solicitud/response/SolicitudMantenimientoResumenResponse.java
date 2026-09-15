package com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response;

import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoResumenProjection;

public record SolicitudMantenimientoResumenResponse(
        Long total,
        Long borradores,
        Long enRevision,
        Long enProceso,
        Long finalizadas
) {
    public static SolicitudMantenimientoResumenResponse from(SolicitudMantenimientoResumenProjection projection) {
        if (projection == null) {
            return new SolicitudMantenimientoResumenResponse(0L, 0L, 0L, 0L, 0L);
        }
        return new SolicitudMantenimientoResumenResponse(
                projection.getTotal() != null ? projection.getTotal() : 0L,
                projection.getBorradores() != null ? projection.getBorradores() : 0L,
                projection.getEnRevision() != null ? projection.getEnRevision() : 0L,
                projection.getEnProceso() != null ? projection.getEnProceso() : 0L,
                projection.getFinalizadas() != null ? projection.getFinalizadas() : 0L
        );
    }
}
