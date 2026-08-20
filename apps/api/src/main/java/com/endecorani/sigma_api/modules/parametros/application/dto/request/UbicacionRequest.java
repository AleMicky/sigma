package com.endecorani.sigma_api.modules.parametros.application.dto;

import com.endecorani.sigma_api.modules.parametros.domain.enums.TipoUbicacion;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

@Schema(
        name = "UbicacionRequest",
        description = "Datos necesarios para registrar o actualizar una ubicación"
)
public record UbicacionRequest(

        @Schema(
                description = "Código único de la ubicación",
                example = "BOG",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El código de la ubicación es obligatorio")
        @Size(
                min = 2,
                max = 30,
                message = "El código debe tener entre 2 y 30 caracteres"
        )
        String codigo,

        @Schema(
                description = "Nombre de la ubicación",
                example = "Bogotá",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El nombre de la ubicación es obligatorio")
        @Size(
                min = 2,
                max = 150,
                message = "El nombre debe tener entre 2 y 150 caracteres"
        )
        String nombre,

        @Schema(
                description = "Descripción de la ubicación",
                example = "Ciudad capital de Colombia"
        )
        @Size(
                max = 250,
                message = "La descripción no puede superar los 250 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Tipo de ubicación",
                example = "CIUDAD",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tipo de ubicación es obligatorio")
        TipoUbicacion tipo,

        @Schema(
                description = "Identificador de la ubicación padre (opcional para nodos raíz)",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID ubicacionPadreId,

        @Schema(
                description = "Dirección física de la ubicación",
                example = "Av. Eléctrica 25-67"
        )
        @Size(
                max = 250,
                message = "La dirección no puede superar los 250 caracteres"
        )
        String direccion,

        @Schema(
                description = "Latitud geográfica",
                example = "4.7110"
        )
        @DecimalMin(
                value = "-90.0000000",
                message = "La latitud debe estar entre -90 y 90"
        )
        @DecimalMax(
                value = "90.0000000",
                message = "La latitud debe estar entre -90 y 90"
        )
        BigDecimal latitud,

        @Schema(
                description = "Longitud geográfica",
                example = "-74.0721"
        )
        @DecimalMin(
                value = "-180.0000000",
                message = "La longitud debe estar entre -180 y 180"
        )
        @DecimalMax(
                value = "180.0000000",
                message = "La longitud debe estar entre -180 y 180"
        )
        BigDecimal longitud
) {
}