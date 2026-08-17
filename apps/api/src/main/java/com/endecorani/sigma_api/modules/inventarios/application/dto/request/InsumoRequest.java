package com.endecorani.sigma_api.modules.inventarios.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "InsumoRequest",
        description = "Datos necesarios para registrar o actualizar un insumo"
)
public record InsumoRequest(
        @Schema(
                description = "Código único del insumo",
                example = "INS-001",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del insumo es obligatorio")
        @Size(
                min = 2,
                max = 30,
                message = "El código debe tener entre 2 y 30 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del insumo",
                example = "Cemento Portland",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del insumo es obligatorio")
        @Size(
                min = 2,
                max = 150,
                message = "El nombre debe tener entre 2 y 150 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción del insumo",
                example = "Cemento para construcción general"
        )
        @Size(
                max = 500,
                message = "La descripción no puede superar los 500 caracteres"
        )
        String descripcion,

        @Schema(
                description = "ID de la categoría de insumo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La categoría de insumo es obligatoria")
        UUID categoriaInsumoId,

        @Schema(
                description = "ID de la unidad de medida",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La unidad de medida es obligatoria")
        UUID unidadMedidaId,

        @Schema(
                description = "Marca del insumo",
                example = "Cemex"
        )
        @Size(
                max = 100,
                message = "La marca no puede superar los 100 caracteres"
        )
        String marca
) {
}
