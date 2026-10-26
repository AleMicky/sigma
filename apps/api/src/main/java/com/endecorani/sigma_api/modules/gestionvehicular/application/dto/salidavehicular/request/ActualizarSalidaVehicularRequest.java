package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request;

import jakarta.validation.constraints.Size;

public record ActualizarSalidaVehicularRequest(
        @Size(max = 1000, message = "El motivo no puede exceder 1000 caracteres")
        String motivo,

        @Size(max = 255, message = "El origen no puede exceder 255 caracteres")
        String origen,

        @Size(max = 255, message = "El destino no puede exceder 255 caracteres")
        String destino
) {
}
