package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "ChecklistMantenimientoResponse",
        description = "Información de un checklist de mantenimiento"
)
public record ChecklistMantenimientoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Información de la actividad de mantenimiento"
        )
        ActividadMantenimientoInfo actividadMantenimiento,

        @Schema(
                description = "Código del checklist",
                example = "CHK-ACEITE-001"
        )
        String codigo,

        @Schema(
                description = "Nombre del checklist",
                example = "Checklist de cambio de aceite"
        )
        String nombre,

        @Schema(
                description = "Descripción del checklist",
                example = "Pasos a seguir para el cambio de aceite"
        )
        String descripcion,

        @Schema(
                description = "Datos de auditoría"
        )
        AuditoriaResponse auditoria
) {
    public record ActividadMantenimientoInfo(
            @Schema(
                    description = "Identificador de la actividad",
                    example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
            )
            UUID id,

            @Schema(
                    description = "Código de la actividad",
                    example = "CAMBIO_ACEITE"
            )
            String codigo,

            @Schema(
                    description = "Nombre de la actividad",
                    example = "Cambio de aceite"
            )
            String nombre
    ) {
    }
}
