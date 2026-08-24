package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(
        name = "OrdenTrabajoResponse",
        description = "Información de una orden de trabajo"
)
public record OrdenTrabajoResponse(
        UUID id,
        String numero,
        UUID solicitudMantenimientoId,
        ActivoInfo activo,
        UserInfo responsable,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        String diagnostico,
        String trabajoRealizado,
        String observacion,
        AuditoriaResponse auditoria
) {
    public record ActivoInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }

    public record UserInfo(
            UUID id,
            String nombre
    ) {
    }
}
