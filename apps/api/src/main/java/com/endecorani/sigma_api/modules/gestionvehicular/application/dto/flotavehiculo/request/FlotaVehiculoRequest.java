package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record FlotaVehiculoRequest(
        @NotNull(message = "El ID de la flota vehicular es obligatorio")
        UUID flotaVehicularId,

        @NotNull(message = "El ID del vehículo (activo) es obligatorio")
        UUID activoId,

        Boolean activo
) {
}
