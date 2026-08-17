package com.endecorani.sigma_api.modules.activos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "AccesorioRequest",
        description = "Datos necesarios para registrar o actualizar un accesorio"
)
public record AccesorioRequest(
        @Schema(
                description = "Identificador de la categoría a la que pertenece",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La categoría es obligatoria")
        UUID categoriaId,

        @Schema(
                description = "Código único del accesorio",
                example = "GPS",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del accesorio es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El código debe tener entre 2 y 50 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del accesorio",
                example = "GPS Navegador",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del accesorio es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El nombre debe tener entre 2 y 100 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción del accesorio",
                example = "Navegador GPS para el vehículo"
        )
        @Size(
                max = 255,
                message = "La descripción no puede superar los 255 caracteres"
        )
        String descripcion
) {
}
