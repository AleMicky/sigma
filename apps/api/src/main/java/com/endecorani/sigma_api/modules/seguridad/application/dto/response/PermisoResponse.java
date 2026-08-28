package com.endecorani.sigma_api.modules.seguridad.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "PermisoResponse",
        description = "Información de un permiso"
)
public record PermisoResponse(

        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Identificador del menú al que pertenece",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID menuId,

        @Schema(
                description = "Código único del permiso",
                example = "CREAR_USUARIO"
        )
        String codigo,

        @Schema(
                description = "Nombre del permiso",
                example = "Crear Usuario"
        )
        String nombre,

        @Schema(
                description = "Descripción del permiso",
                example = "Permite crear nuevos usuarios en el sistema"
        )
        String descripcion,

        @Schema(
                description = "Método HTTP del permiso",
                example = "POST"
        )
        String metodoHttp,

        @Schema(
                description = "Ruta del recurso",
                example = "/api/v1/usuarios"
        )
        String ruta,

        @Schema(
                description = "Indica si el permiso está activo",
                example = "true"
        )
        boolean activo,

        @Schema(description = "Datos de auditoría")
        AuditoriaResponse auditoria
) {
}
