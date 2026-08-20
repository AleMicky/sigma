package com.endecorani.sigma_api.modules.parametros.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(
        name = "TipoDatoRequest",
        description = "Datos necesarios para registrar o actualizar un tipo de dato"
)
public record TipoDatoRequest(
        @Schema(
                description = "Código único del tipo de dato",
                example = "SELECT",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del tipo de dato es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El código debe tener entre 2 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del tipo de dato",
                example = "Selección",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del tipo de dato es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción del tipo de dato",
                example = "Permite seleccionar una opción de un catálogo"
        )
        @Size(
                max = 255,
                message = "La descripción no puede superar los 255 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Indica si el tipo de dato admite opciones de catálogo",
                example = "true",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El indicador de opciones es obligatorio")
        Boolean permiteOpciones
) {
}
