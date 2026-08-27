package com.endecorani.sigma_api.modules.seguridad.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "MenuRequest",
        description = "Datos necesarios para registrar o actualizar un menú"
)
public record MenuRequest(

        @Schema(
                description = "Código único del menú",
                example = "USUARIOS",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del menú es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El código debe tener entre 2 y 100 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del menú",
                example = "Usuarios",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del menú es obligatorio")
        @Size(
                min = 2,
                max = 150,
                message = "El nombre debe tener entre 2 y 150 caracteres"
        )
        String nombre,

        @Schema(
                description = "Icono del menú",
                example = "users"
        )
        @Size(
                max = 100,
                message = "El icono no puede superar los 100 caracteres"
        )
        String icono,

        @Schema(
                description = "Ruta del menú",
                example = "/seguridad/usuarios"
        )
        @Size(
                max = 300,
                message = "La ruta no puede superar los 300 caracteres"
        )
        String ruta,

        @Schema(
                description = "Identificador del menú padre (opcional para nodos raíz)",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID menuPadreId,

        @Schema(
                description = "Orden de presentación del menú",
                example = "10"
        )
        @Min(
                value = 0,
                message = "El orden no puede ser menor a 0"
        )
        @Max(
                value = 2147483647,
                message = "El orden excede el valor máximo permitido"
        )
        Integer orden,

        @Schema(
                description = "Indica si el menú está activo",
                example = "true"
        )
        Boolean activo
) {
}
