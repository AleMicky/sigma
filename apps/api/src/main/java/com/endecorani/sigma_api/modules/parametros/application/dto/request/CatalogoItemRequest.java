package com.endecorani.sigma_api.modules.parametros.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "CatalogoItemRequest",
        description = "Datos necesarios para registrar o actualizar un ítem de catálogo"
)
public record CatalogoItemRequest(
        @Schema(
                description = "Identificador del catálogo al que pertenece",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El catálogo es obligatorio")
        UUID catalogoId,

        @Schema(
                description = "Nombre del ítem",
                example = "Cédula de identidad",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del ítem es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Valor único del ítem dentro del catálogo",
                example = "CI",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El valor del ítem es obligatorio")
        @Size(
                min = 1,
                max = 50,
                message = "El valor debe tener entre 1 y 50 caracteres"
        )
        String valor,

        @Schema(
                description = "Orden de visualización",
                example = "1"
        )
        Integer orden
) {
}
