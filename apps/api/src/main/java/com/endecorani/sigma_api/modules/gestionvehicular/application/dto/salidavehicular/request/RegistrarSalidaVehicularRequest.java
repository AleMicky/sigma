package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record RegistrarSalidaVehicularRequest(
        @NotNull(message = "El vehículo (activoId) es obligatorio")
        UUID activoId,

        UUID empleadoId,

        @NotBlank(message = "El motivo es obligatorio")
        @Size(max = 1000, message = "El motivo no puede exceder 1000 caracteres")
        String motivo,

        @NotBlank(message = "El origen es obligatorio")
        @Size(max = 255, message = "El origen no puede exceder 255 caracteres")
        String origen,

        @NotBlank(message = "El destino es obligatorio")
        @Size(max = 255, message = "El destino no puede exceder 255 caracteres")
        String destino
) {
}
