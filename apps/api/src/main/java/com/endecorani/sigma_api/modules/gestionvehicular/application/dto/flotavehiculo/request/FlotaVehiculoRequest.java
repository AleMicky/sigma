package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record FlotaVehiculoRequest(
        @NotNull(message = "El ID de la flota vehicular es obligatorio")
        UUID flotaVehicularId,

        UUID activoId,

        List<UUID> activoIds,

        Boolean activo
) {
}
