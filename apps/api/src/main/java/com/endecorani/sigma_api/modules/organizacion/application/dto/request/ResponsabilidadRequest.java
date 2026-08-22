package com.endecorani.sigma_api.modules.organizacion.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(
        name = "ResponsabilidadRequest",
        description = "Datos necesarios para registrar o actualizar una responsabilidad"
)
public record ResponsabilidadRequest(
        @Schema(
                description = "Código único de la responsabilidad",
                example = "RESP-COMPRAS",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código de la responsabilidad es obligatorio")
        @Size(
                min = 2,
                max = 30,
                message = "El código debe tener entre 2 y 30 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre de la responsabilidad",
                example = "Aprobación de compras",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre de la responsabilidad es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción de la responsabilidad",
                example = "Responsable de aprobar solicitudes de compra"
        )
        @Size(
                max = 250,
                message = "La descripción no puede superar los 250 caracteres"
        )
        String descripcion
) {
}
