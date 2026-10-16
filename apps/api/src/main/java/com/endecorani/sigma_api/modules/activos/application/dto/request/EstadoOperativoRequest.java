package com.endecorani.sigma_api.modules.activos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(
        name = "EstadoOperativoRequest",
        description = "Datos necesarios para registrar o actualizar un estado operativo de activos"
)
public record EstadoOperativoRequest(
        @Schema(
                description = "Código único del estado operativo",
                example = "OPERATIVO",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del estado operativo es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El código debe tener entre 2 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del estado operativo",
                example = "Operativo",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del estado operativo es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción del estado operativo",
                example = "Activo en condiciones normales de funcionamiento"
        )
        @Size(
                max = 255,
                message = "La descripción no puede superar los 255 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Color hexadecimal del estado (#RRGGBB)",
                example = "#10B981"
        )
        @Pattern(
                regexp = "^$|^#(?:[0-9A-Fa-f]{6})$",
                message = "El color debe tener el formato #RRGGBB"
        )
        @Size(max = 7, message = "El color no puede superar 7 caracteres")
        String color
) {
}
