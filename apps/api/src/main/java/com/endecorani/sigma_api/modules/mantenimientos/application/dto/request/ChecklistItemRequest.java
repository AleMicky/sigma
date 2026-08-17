package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "ChecklistItemRequest",
        description = "Datos necesarios para registrar o actualizar un item de checklist"
)
public record ChecklistItemRequest(
        @Schema(
                description = "Identificador del checklist de mantenimiento",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El checklist de mantenimiento es obligatorio")
        UUID checklistMantenimientoId,

        @Schema(
                description = "Código único del item dentro del checklist",
                example = "ITEM-001",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del item es obligatorio")
        @Size(
                min = 1,
                max = 50,
                message = "El código debe tener entre 1 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del item",
                example = "Nivel de aceite",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del item es obligatorio")
        @Size(
                min = 1,
                max = 200,
                message = "El nombre debe tener entre 1 y 200 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción del item",
                example = "Verificar que el nivel de aceite esté dentro del rango aceptable"
        )
        @Size(
                max = 500,
                message = "La descripción no puede superar los 500 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Identificador del tipo de dato del item",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tipo de dato es obligatorio")
        UUID tipoDatoId,

        @Schema(
                description = "Orden del item dentro del checklist",
                example = "1",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El orden es obligatorio")
        @Min(value = 0, message = "El orden debe ser mayor o igual a 0")
        Integer orden,

        @Schema(
                description = "Indica si el item es obligatorio",
                example = "true"
        )
        Boolean obligatorio,

        @Schema(
                description = "Opciones del item en formato JSON (para tipos select)",
                example = "[{\"value\":\"SI\",\"label\":\"Sí\"},{\"value\":\"NO\",\"label\":\"No\"}]"
        )
        String opciones
) {
}
