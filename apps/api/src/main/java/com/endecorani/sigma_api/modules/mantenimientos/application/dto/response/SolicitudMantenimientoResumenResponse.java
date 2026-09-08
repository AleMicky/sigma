package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoResumenProjection;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        name = "SolicitudMantenimientoResumenResponse",
        description = "Resumen y conteo de solicitudes de mantenimiento por estado"
)
public record SolicitudMantenimientoResumenResponse(
        @Schema(description = "Total de solicitudes de mantenimiento", example = "10")
        Long total,

        @Schema(description = "Solicitudes en estado borrador", example = "2")
        Long borradores,

        @Schema(description = "Solicitudes en revisión (SOLICITADO, OBSERVADO)", example = "3")
        Long enRevision,

        @Schema(description = "Solicitudes en proceso (ASIGNADO, EN_MANTENIMIENTO, EN_REVISION, OBSERVADO_MANTENIMIENTO, VALIDADO, TRABAJO_REALIZADO)", example = "4")
        Long enProceso,

        @Schema(description = "Solicitudes finalizadas (FINALIZADO, CERRADO)", example = "1")
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
