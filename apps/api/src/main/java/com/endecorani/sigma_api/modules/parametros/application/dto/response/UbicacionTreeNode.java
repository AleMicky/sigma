package com.endecorani.sigma_api.modules.parametros.application.dto.response;

import com.endecorani.sigma_api.modules.parametros.domain.enums.TipoUbicacion;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(
        name = "UbicacionTreeNode",
        description = "Nodo de árbol jerárquico de ubicaciones"
)
public record UbicacionTreeNode(

        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código único de la ubicación",
                example = "BOG"
        )
        String codigo,

        @Schema(
                description = "Nombre de la ubicación",
                example = "Bogotá"
        )
        String nombre,

        @Schema(
                description = "Tipo de ubicación",
                example = "CIUDAD"
        )
        TipoUbicacion tipo,

        @Schema(
                description = "Identificador de la ubicación padre",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID ubicacionPadreId,

        @Schema(
                description = "Lista de ubicaciones hijas"
        )
        List<UbicacionTreeNode> hijos
) {
}