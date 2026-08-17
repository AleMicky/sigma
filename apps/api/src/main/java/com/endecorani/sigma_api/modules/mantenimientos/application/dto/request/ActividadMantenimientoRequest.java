package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(
        name = "ActividadMantenimientoRequest",
        description = "Datos necesarios para registrar o actualizar una actividad de mantenimiento"
)
public record ActividadMantenimientoRequest(
        @Schema(
                description = "Código único de la actividad",
                example = "ACT-001",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código de la actividad es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El código debe tener entre 2 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre de la actividad",
                example = "Cambio de aceite",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre de la actividad es obligatorio")
        @Size(
                min = 2,
                max = 150,
                message = "El nombre debe tener entre 2 y 150 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción de la actividad",
                example = "Realizar cambio de aceite y filtro del motor"
        )
        @Size(
                max = 500,
                message = "La descripción no puede superar los 500 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Indica si aplica a todos los tipos de activo",
                example = "false"
        )
        Boolean aplicaTodosTiposActivo,

        @Schema(
                description = "Indica si requiere checklist",
                example = "false"
        )
        Boolean requiereChecklist
) {
}
