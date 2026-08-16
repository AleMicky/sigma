package com.endecorani.sigma_api.modules.activos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "AccesorioResponse",
        description = "Información de un accesorio"
)
public record AccesorioResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Información del catálogo / tipo de activo"
        )
        CatalogoInfo catalogo,

        @Schema(
                description = "Código del accesorio",
                example = "GPS"
        )
        String codigo,

        @Schema(
                description = "Nombre del accesorio",
                example = "GPS Navegador"
        )
        String nombre,

        @Schema(
                description = "Descripción del accesorio",
                example = "Navegador GPS para el vehículo"
        )
        String descripcion,

        @Schema(
                description = "Datos de auditoría"
        )
        AuditoriaResponse auditoria
) {
    public record CatalogoInfo(
            @Schema(
                    description = "Identificador del tipo de activo",
                    example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
            )
            UUID id,

            @Schema(
                    description = "Código del tipo de activo",
                    example = "VEHICULO"
            )
            String codigo,

            @Schema(
                    description = "Nombre del tipo de activo",
                    example = "Vehículo"
            )
            String nombre
    ) {
    }
}