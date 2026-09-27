package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record SincronizarFlotaVehiculosRequest(
        @NotNull(message = "La lista de vehículos (activos) no puede ser nula")
        List<UUID> activoIds
) {
}
