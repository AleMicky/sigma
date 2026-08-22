package com.endecorani.sigma_api.modules.organizacion.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Schema(
        name = "PersonaRequest",
        description = "Datos necesarios para registrar o actualizar una persona"
)
public record PersonaRequest(
        @Schema(
                description = "Tipo de documento de identidad",
                example = "CI",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El tipo de documento es obligatorio")
        @Size(
                min = 2,
                max = 20,
                message = "El tipo de documento debe tener entre 2 y 20 caracteres"
        )
        String tipoDocumento,

        @Schema(
                description = "Número de documento de identidad",
                example = "12345678",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El número de documento es obligatorio")
        @Size(
                min = 2,
                max = 50,
                message = "El número de documento debe tener entre 2 y 50 caracteres"
        )
        String numeroDocumento,

        @Schema(
                description = "Complemento del documento (ej. sufijo boliviano)",
                example = "1A"
        )
        @Size(
                max = 10,
                message = "El complemento no puede superar los 10 caracteres"
        )
        String complemento,

        @Schema(
                description = "Nombres de la persona",
                example = "Juan Carlos",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "Los nombres son obligatorios")
        @Size(
                min = 2,
                max = 100,
                message = "Los nombres deben tener entre 2 y 100 caracteres"
        )
        String nombres,

        @Schema(
                description = "Primer apellido",
                example = "Pérez",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El primer apellido es obligatorio")
        @Size(
                min = 2,
                max = 100,
                message = "El primer apellido debe tener entre 2 y 100 caracteres"
        )
        String primerApellido,

        @Schema(
                description = "Segundo apellido",
                example = "Gómez"
        )
        @Size(
                max = 100,
                message = "El segundo apellido no puede superar los 100 caracteres"
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
        @Size(
                max = 30,
                message = "El teléfono no puede superar los 30 caracteres"
        )
        String telefono,

        @Schema(
                description = "Correo electrónico",
                example = "juan.perez@institucion.gob"
        )
        @Email(message = "El correo debe ser una dirección válida")
        @Size(
                max = 150,
                message = "El correo no puede superar los 150 caracteres"
        )
        String correo
) {
}