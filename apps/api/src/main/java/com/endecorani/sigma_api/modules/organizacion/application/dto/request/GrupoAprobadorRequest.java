package com.endecorani.sigma_api.modules.organizacion.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(
        name = "GrupoAprobadorRequest",
        description = "Datos necesarios para registrar o actualizar un grupo aprobador"
)
public record GrupoAprobadorRequest(
        @Schema(
                description = "Código único del grupo aprobador",
                example = "GA-FINANZAS",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del grupo aprobador es obligatorio")
        @Size(
                min = 2,
                max = 30,
                message = "El código debe tener entre 2 y 30 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del grupo aprobador",
                example = "Aprobadores de Finanzas",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del grupo aprobador es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción del grupo aprobador",
                example = "Grupo encargado de aprobar solicitudes del área de finanzas"
        )
        @Size(
                max = 250,
                message = "La descripción no puede superar los 250 caracteres"
        )
        String descripcion
) {
}
