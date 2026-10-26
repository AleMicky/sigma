package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request;

import jakarta.validation.constraints.Size;

public record CancelarSalidaVehicularRequest(
        @Size(max = 1000, message = "El motivo de cancelación no puede exceder 1000 caracteres")
        String motivo
) {
}
