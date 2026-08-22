package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "ActividadMantenimientoAplicacionResponse",
        description = "Información de la aplicación de una actividad de mantenimiento"
)
public record ActividadMantenimientoAplicacionResponse(
        UUID id,
        ActividadMantenimientoInfo actividadMantenimiento,
        TipoActivoInfo tipoActivo,
        ComponenteInfo componente,
        AuditoriaResponse auditoria
) {
    public record ActividadMantenimientoInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }

    public record TipoActivoInfo(
            UUID id,
            String nombre
    ) {
    }

    public record ComponenteInfo(
            UUID id,
            String nombre
    ) {
    }
}
