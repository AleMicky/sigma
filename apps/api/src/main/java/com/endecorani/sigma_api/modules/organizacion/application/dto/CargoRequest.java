package com.endecorani.sigma_api.modules.organizacion.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(
        name = "CargoRequest",
        description = "Datos necesarios para registrar o actualizar un cargo"
)
public record CargoRequest(
        @Schema(
                description = "Código único del cargo",
                example = "ANALISTA",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del cargo es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El código debe tener entre 2 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del cargo",
                example = "Analista de Sistemas",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del cargo es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción del cargo",
                example = "Cargo encargado del análisis de requerimientos"
        )
        @Size(
                max = 255,
                message = "La descripción no puede superar los 255 caracteres"
        )
        String descripcion
) {
}