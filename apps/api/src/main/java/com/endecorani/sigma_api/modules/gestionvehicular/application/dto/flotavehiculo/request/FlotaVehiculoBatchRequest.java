package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record FlotaVehiculoBatchRequest(
        @NotNull(message = "El ID de la flota vehicular es obligatorio")
        UUID flotaVehicularId,

        @NotEmpty(message = "Debe proporcionar al menos un vehículo (activo)")
        List<UUID> activoIds,

        Boolean activo
) {
}
