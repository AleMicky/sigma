package com.endecorani.sigma_api.modules.inventarios.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "InsumoResponse",
        description = "Información de un insumo"
)
public record InsumoResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código del insumo",
                example = "INS-001"
        )
        String codigo,

        @Schema(
                description = "Nombre del insumo",
                example = "Cemento Portland"
        )
        String nombre,

        @Schema(
                description = "Descripción",
                example = "Cemento para construcción general"
        )
        String descripcion,

        @Schema(
                description = "Información de la categoría de insumo"
        )
        BaseInfo categoriaInsumo,

        @Schema(
                description = "Información de la unidad de medida"
        )
        BaseInfo unidadMedida,

        @Schema(
                description = "Marca del insumo",
                example = "Cemex"
        )
        String marca,

        @Schema(
                description = "Datos de auditoría"
        )
        AuditoriaResponse auditoria
) {
        public record BaseInfo(
                @Schema(
                        description = "Identificador único",
                        example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
                )
                UUID id,

                @Schema(
                        description = "Código",
                        example = "COD-001"
                )
                String codigo,

                @Schema(
                        description = "Nombre",
                        example = "Nombre Ejemplo"
                )
                String nombre
        ) {}
}

