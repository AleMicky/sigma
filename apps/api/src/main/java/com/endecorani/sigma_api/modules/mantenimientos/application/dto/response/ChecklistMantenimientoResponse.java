package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "ChecklistMantenimientoResponse",
        description = "Información de un checklist de mantenimiento"
)
public record ChecklistMantenimientoResponse(
        UUID id,
        ActividadMantenimientoInfo actividadMantenimiento,
        String codigo,
        String nombre,
        String descripcion,
        AuditoriaResponse auditoria
) {
    public record ActividadMantenimientoInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }
}
