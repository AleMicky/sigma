package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "ChecklistMantenimientoRequest",
        description = "Datos necesarios para registrar o actualizar un checklist de mantenimiento"
)
public record ChecklistMantenimientoRequest(
        @Schema(
                description = "Identificador de la actividad de mantenimiento",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La actividad de mantenimiento es obligatoria")
        UUID actividadMantenimientoId,

        @Schema(
                description = "Código único del checklist",
                example = "CHK-ACEITE-001",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del checklist es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El código debe tener entre 2 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del checklist",
                example = "Checklist de cambio de aceite",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del checklist es obligatorio")
        @Size(
                min = 2,
                max = 150,
                message = "El nombre debe tener entre 2 y 150 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción del checklist",
                example = "Pasos a seguir para el cambio de aceite"
        )
        @Size(
                max = 500,
                message = "La descripción no puede superar los 500 caracteres"
        )
        String descripcion
) {
}
