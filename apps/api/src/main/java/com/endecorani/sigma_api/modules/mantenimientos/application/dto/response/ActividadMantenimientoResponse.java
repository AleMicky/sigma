package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "ActividadMantenimientoResponse",
        description = "Información de una actividad de mantenimiento"
)
public record ActividadMantenimientoResponse(
        UUID id,
        String codigo,
        String nombre,
        String descripcion,
        Boolean aplicaTodosTiposActivo,
        Boolean requiereChecklist,
        AuditoriaResponse auditoria
) {
}
