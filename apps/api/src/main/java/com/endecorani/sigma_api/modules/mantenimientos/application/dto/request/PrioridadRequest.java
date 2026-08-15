package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(
        name = "PrioridadRequest",
        description = "Datos necesarios para registrar o actualizar una prioridad de mantenimiento"
)
public record PrioridadRequest(
        @Schema(
                description = "Código único de prioridad",
                example = "ALTA",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código de la prioridad es obligatorio")
        @Size(
                min = 2,
                max = 30,
                message = "El código debe tener entre 2 y 30 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre de la prioridad",
                example = "Alta",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre de la prioridad es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción de la prioridad",
                example = "Atención inmediata para evitar fallas críticas."
        )
        @Size(
                max = 300,
                message = "La descripción no puede superar los 300 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Nivel de prioridad",
                example = "1",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El nivel de prioridad es obligatorio")
        @Min(value = 1, message = "El nivel de prioridad debe ser mayor o igual a 1")
        @Max(value = 5, message = "El nivel de prioridad no puede ser mayor a 5")
        Integer nivel
) {
}