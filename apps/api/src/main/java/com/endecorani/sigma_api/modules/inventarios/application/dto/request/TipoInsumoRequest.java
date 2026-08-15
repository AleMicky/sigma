package com.endecorani.sigma_api.modules.inventarios.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(
        name = "TipoInsumoRequest",
        description = "Datos necesarios para registrar o actualizar un tipo de insumo"
)
public record TipoInsumoRequest(
        @Schema(
                description = "Código único del tipo de insumo",
                example = "MATERIA_PRIMA",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del tipo de insumo es obligatorio")
        @Size(
                min = 2,
                max = 30,
                message = "El código debe tener entre 2 y 30 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del tipo de insumo",
                example = "Materia prima",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del tipo de insumo es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción del tipo de insumo",
                example = "Insumos utilizados como materia prima"
        )
        @Size(
                max = 300,
                message = "La descripción no puede superar los 300 caracteres"
        )
        String descripcion
) {
}
