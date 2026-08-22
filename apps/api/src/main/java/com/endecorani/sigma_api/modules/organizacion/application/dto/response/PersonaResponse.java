package com.endecorani.sigma_api.modules.organizacion.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "PersonaResponse",
        description = "Información de una persona"
)
public record PersonaResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Tipo de documento de identidad",
                example = "CI"
        )
        String tipoDocumento,

        @Schema(
                description = "Número de documento de identidad",
                example = "12345678"
        )
        String numeroDocumento,

        @Schema(
                description = "Complemento del documento",
                example = "1A"
        )
        String complemento,

        @Schema(
                description = "Nombres de la persona",
                example = "Juan Carlos"
        )
        String nombres,

        @Schema(
                description = "Primer apellido",
                example = "Pérez"
        )
        String primerApellido,

        @Schema(
                description = "Segundo apellido",
                example = "Gómez"
        )
        String segundoApellido,

        @Schema(
                description = "Fecha de nacimiento",
                example = "1990-05-20"
        )
        LocalDate fechaNacimiento,

        @Schema(
                description = "Teléfono de contacto",
                example = "+591 77712345"
        )
        String telefono,

        @Schema(
                description = "Correo electrónico",
                example = "juan.perez@institucion.gob"
        )
        String correo,

        @Schema(description = "Fecha de creación")
        Instant createdAt,

        @Schema(description = "Fecha de última actualización")
        Instant updatedAt,

        @Schema(description = "Usuario que creó el registro")
        String createdBy,

        @Schema(description = "Usuario que actualizó el registro")
        String updatedBy
) {
}