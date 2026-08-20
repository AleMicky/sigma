package com.endecorani.sigma_api.modules.parametros.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(
        name = "CatalogoRequest",
        description = "Datos necesarios para registrar o actualizar un catálogo"
)
public record CatalogoRequest(
        @Schema(
                description = "Código único del catálogo",
                example = "ESTADO_CIVIL",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del catálogo es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El código debe tener entre 2 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del catálogo",
                example = "Estado civil",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del catálogo es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre
) {
}
