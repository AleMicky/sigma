package com.endecorani.sigma_api.modules.inventarios.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "CategoriaInsumoRequest",
        description = "Datos necesarios para registrar o actualizar una categoría de insumo"
)
public record CategoriaInsumoRequest(
        @Schema(
                description = "ID del tipo de insumo al que pertenece la categoría",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El ID del tipo de insumo es obligatorio")
        UUID tipoInsumoId,

        @Schema(
                description = "Código único de la categoría de insumo",
                example = "ALIMENTOS",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código de la categoría de insumo es obligatorio")
        @Size(
                min = 2,
                max = 20,
                message = "El código debe tener entre 2 y 20 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre de la categoría de insumo",
                example = "Alimentos",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre de la categoría de insumo es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción de la categoría de insumo",
                example = "Insumos alimenticios"
        )
        @Size(
                max = 300,
                message = "La descripción no puede superar los 300 caracteres"
        )
        String descripcion
) {
}
