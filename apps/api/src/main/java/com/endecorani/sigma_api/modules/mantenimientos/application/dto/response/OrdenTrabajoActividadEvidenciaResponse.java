package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "OrdenTrabajoActividadEvidenciaResponse",
        description = "Información de una evidencia de actividad de orden de trabajo"
)
public record OrdenTrabajoActividadEvidenciaResponse(
        UUID id,
        OrdenTrabajoActividadInfo ordenTrabajoActividad,
        String nombreArchivo,
        String tipoMime,
        Long tamanio,
        String url,
        AuditoriaResponse auditoria
) {
    public record OrdenTrabajoActividadInfo(
            UUID id,
            String descripcion
    ) {
    }
}
