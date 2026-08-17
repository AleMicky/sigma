package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "ActividadMantenimientoAplicacionResponse",
        description = "Información de la aplicación de una actividad de mantenimiento"
)
public record ActividadMantenimientoAplicacionResponse(
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
                description = "Información del tipo de activo"
        )
        TipoActivoInfo tipoActivo,

        @Schema(
                description = "Información del componente"
        )
        ComponenteInfo componente,

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

    public record TipoActivoInfo(
            @Schema(
                    description = "Identificador del tipo de activo",
                    example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
            )
            UUID id,

            @Schema(
                    description = "Nombre del tipo de activo",
                    example = "Vehículo"
            )
            String nombre
    ) {
    }

    public record ComponenteInfo(
            @Schema(
                    description = "Identificador del componente",
                    example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
            )
            UUID id,

            @Schema(
                    description = "Nombre del componente",
                    example = "Motor"
            )
            String nombre
    ) {
    }
}
