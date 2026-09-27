package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ResponsableFlotaRequest(
        @NotNull(message = "El ID de la flota vehicular es obligatorio")
        UUID flotaVehicularId,

        @NotNull(message = "El ID del empleado es obligatorio")
        UUID empleadoId,

        Boolean principal,

        Boolean activo
) {
}
