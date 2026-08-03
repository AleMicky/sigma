package com.endecorani.sigma_api.modules.activos.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(
        name = "ActivoAtributoOpcion",
        description = "Opción de un atributo SELECT o MULTISELECT"
)
public record ActivoAtributoOpcionDto(
        @Schema(
                description = "Valor interno de la opción",
                example = "GASOLINA",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El valor de la opción es obligatorio")
        @Size(
                min = 1,
                max = 100,
                message = "El valor de la opción debe tener entre 1 y 100 caracteres"
        )
        String value,

        @Schema(
                description = "Etiqueta visible de la opción",
                example = "Gasolina",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "La etiqueta de la opción es obligatoria")
        @Size(
                min = 1,
                max = 100,
                message = "La etiqueta de la opción debe tener entre 1 y 100 caracteres"
        )
        String label
) {
}
