package com.endecorani.sigma_api.modules.activos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

@Schema(description = "Datos para crear o actualizar un documento de activo")
public record ActivoDocumentoRequest(
        @NotNull(message = "El activo es requerido")
        @Schema(description = "ID del activo", example = "123e4567-e89b-12d3-a456-426614174000")
        UUID activoId,

        @NotNull(message = "El tipo de documento es requerido")
        @Schema(description = "ID del tipo de documento", example = "123e4567-e89b-12d3-a456-426614174001")
        UUID tipoDocumentoId,

        @Size(max = 100, message = "El número de documento no puede tener más de 100 caracteres")
        @Schema(description = "Número del documento", example = "DOC-2023-001")
        String numeroDocumento,

        @NotBlank(message = "El nombre es requerido")
        @Size(max = 150, message = "El nombre no puede tener más de 150 caracteres")
        @Schema(description = "Nombre del documento", example = "Manual de usuario")
        String nombre,

        @Size(max = 500, message = "La descripción no puede tener más de 500 caracteres")
        @Schema(description = "Descripción del documento")
        String descripcion,

        @Schema(description = "Fecha de emisión del documento", example = "2023-01-01")
        LocalDate fechaEmision,

        @Schema(description = "Fecha de vencimiento del documento", example = "2024-01-01")
        LocalDate fechaVencimiento
) {
}
