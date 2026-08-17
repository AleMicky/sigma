package com.endecorani.sigma_api.modules.activos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "ActivoAccesorioResponse",
        description = "Información de un accesorio asignado a un activo"
)
public record ActivoAccesorioResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Información del activo"
        )
        ActivoInfo activo,

        @Schema(
                description = "Información del accesorio"
        )
        AccesorioInfo accesorio,

        @Schema(
                description = "Cantidad del accesorio",
                example = "1"
        )
        Integer cantidad,

        @Schema(
                description = "Número de serie",
                example = "SN-12345"
        )
        String numeroSerie,

        @Schema(
                description = "Observación",
                example = "Accesorio instalado en la cabina"
        )
        String observacion,

        @Schema(
                description = "Datos de auditoría"
        )
        AuditoriaResponse auditoria
) {
    public record ActivoInfo(
            @Schema(
                    description = "Identificador del activo",
                    example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
            )
            UUID id,

            @Schema(
                    description = "Código del activo",
                    example = "ACT-001"
            )
            String codigo,

            @Schema(
                    description = "Nombre del activo",
                    example = "Camioneta Toyota Hilux"
            )
            String nombre
    ) {
    }

    public record AccesorioInfo(
            @Schema(
                    description = "Identificador del accesorio",
                    example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
            )
            UUID id,

            @Schema(
                    description = "Código del accesorio",
                    example = "GPS"
            )
            String codigo,

            @Schema(
                    description = "Nombre del accesorio",
                    example = "GPS Navegador"
            )
            String nombre
    ) {
    }
}
