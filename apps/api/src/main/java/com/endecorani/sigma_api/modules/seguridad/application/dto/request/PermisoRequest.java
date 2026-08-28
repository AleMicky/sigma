package com.endecorani.sigma_api.modules.seguridad.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(
        name = "PermisoRequest",
        description = "Datos necesarios para registrar o actualizar un permiso"
)
public record PermisoRequest(

        @Schema(
                description = "Identificador del menú al que pertenece el permiso",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El menú es obligatorio")
        UUID menuId,

        @Schema(
                description = "Código único del permiso",
                example = "CREAR_USUARIO",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código del permiso es obligatorio")
        @Size(
                min = 2,
                max = 200,
                message = "El código debe tener entre 2 y 200 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre del permiso",
                example = "Crear Usuario",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre del permiso es obligatorio")
        @Size(
                min = 2,
                max = 200,
                message = "El nombre debe tener entre 2 y 200 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción del permiso",
                example = "Permite crear nuevos usuarios en el sistema"
        )
        @Size(
                max = 500,
                message = "La descripción no puede superar los 500 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Método HTTP del permiso",
                example = "POST",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El método HTTP es obligatorio")
        @Size(
                min = 1,
                max = 10,
                message = "El método HTTP debe tener entre 1 y 10 caracteres"
        )
        String metodoHttp,

        @Schema(
                description = "Ruta del recurso",
                example = "/api/v1/usuarios",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "La ruta es obligatoria")
        @Size(
                min = 1,
                max = 500,
                message = "La ruta debe tener entre 1 y 500 caracteres"
        )
        String ruta,

        @Schema(
                description = "Indica si el permiso está activo",
                example = "true"
        )
        Boolean activo
) {
}
