package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(
        name = "OrdenTrabajoActividadResponse",
        description = "Información de una actividad de orden de trabajo"
)
public record OrdenTrabajoActividadResponse(
        UUID id,
        OrdenTrabajoInfo ordenTrabajo,
        ActividadMantenimientoInfo actividadMantenimiento,
        String descripcion,
        boolean realizado,
        String observacion,
        LocalDateTime fechaRealizacion,
        AuditoriaResponse auditoria
) {
    public record OrdenTrabajoInfo(
            UUID id,
            String numero
    ) {
    }

    public record ActividadMantenimientoInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }
}
