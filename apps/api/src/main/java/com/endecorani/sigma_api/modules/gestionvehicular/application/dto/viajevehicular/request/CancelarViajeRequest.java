package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelarViajeRequest(
        @NotBlank(message = "El motivo de cancelación es obligatorio")
        @Size(max = 1000, message = "El motivo de cancelación no puede superar los 1000 caracteres")
        String motivoCancelacion
) {
}
