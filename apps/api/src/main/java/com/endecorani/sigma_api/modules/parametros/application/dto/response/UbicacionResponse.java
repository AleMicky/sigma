package com.endecorani.sigma_api.modules.parametros.application.dto;

import com.endecorani.sigma_api.modules.parametros.domain.enums.TipoUbicacion;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "UbicacionResponse",
        description = "Información de una ubicación"
)
public record UbicacionResponse(

        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Código único de la ubicación",
                example = "BOG"
        )
        String codigo,

        @Schema(
                description = "Nombre de la ubicación",
                example = "Bogotá"
        )
        String nombre,

        @Schema(
                description = "Descripción de la ubicación",
                example = "Ciudad capital de Colombia"
        )
        String descripcion,

        @Schema(
                description = "Tipo de ubicación",
                example = "CIUDAD"
        )
        TipoUbicacion tipo,

        @Schema(
                description = "Identificador de la ubicación padre",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID ubicacionPadreId,

        @Schema(
                description = "Dirección física de la ubicación",
                example = "Av. Eléctrica 25-67"
        )
        String direccion,

        @Schema(
                description = "Latitud geográfica",
                example = "4.7110000"
        )
        BigDecimal latitud,

        @Schema(
                description = "Longitud geográfica",
                example = "-74.0721000"
        )
        BigDecimal longitud,

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