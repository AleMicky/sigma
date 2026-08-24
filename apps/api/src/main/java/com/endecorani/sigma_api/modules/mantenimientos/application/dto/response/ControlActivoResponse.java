package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoControlActivo;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(
        name = "ControlActivoResponse",
        description = "Información de control de activo"
)
public record ControlActivoResponse(
        UUID id,
        UUID solicitudMantenimientoId,
        UUID ordenTrabajoId,
        ActivoInfo activo,
        TipoControlActivo tipo,
        UserInfo entregadoPor,
        UserInfo recibidoPor,
        LocalDateTime fecha,
        boolean conforme,
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
