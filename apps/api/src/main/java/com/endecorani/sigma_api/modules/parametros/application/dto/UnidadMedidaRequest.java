package com.endecorani.sigma_api.modules.parametros.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(
        name = "UnidadMedidaRequest",
        description = "Datos necesarios para registrar o actualizar una unidad de medida"
)
public record UnidadMedidaRequest(
        @Schema(
                description = "Código único de la unidad de medida",
                example = "KG",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código de la unidad de medida es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El código debe tener entre 2 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre de la unidad de medida",
                example = "Kilogramo",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre de la unidad de medida es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Símbolo de la unidad de medida",
                example = "kg",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El símbolo de la unidad de medida es obligatorio")
        @Size(
                min = 1,
                max = 20,
                message = "El símbolo debe tener entre 1 y 20 caracteres"
        )
        String simbolo,

        @Schema(
                description = "Indica si la unidad de medida admite valores decimales",
                example = "true",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El indicador de decimales es obligatorio")
        Boolean permiteDecimal
) {
}
