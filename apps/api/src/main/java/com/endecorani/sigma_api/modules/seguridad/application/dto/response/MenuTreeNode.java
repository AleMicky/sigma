package com.endecorani.sigma_api.modules.seguridad.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(
        name = "MenuTreeNode",
        description = "Nodo de árbol jerárquico de menús"
)
public record MenuTreeNode(

        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Identificador del menú padre",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID menuPadreId,

        @Schema(
                description = "Código único del menú",
                example = "USUARIOS"
        )
        String codigo,

        @Schema(
                description = "Nombre del menú",
                example = "Usuarios"
        )
        String nombre,

        @Schema(
                description = "Icono del menú",
                example = "users"
        )
        String icono,

        @Schema(
                description = "Ruta del menú",
                example = "/seguridad/usuarios"
        )
        String ruta,

        @Schema(
                description = "Orden de presentación del menú",
                example = "10"
        )
        Integer orden,

        @Schema(
                description = "Indica si el menú está activo",
                example = "true"
        )
        boolean activo,

        @Schema(
                description = "Lista de menús hijos"
        )
        List<MenuTreeNode> hijos
) {
}
