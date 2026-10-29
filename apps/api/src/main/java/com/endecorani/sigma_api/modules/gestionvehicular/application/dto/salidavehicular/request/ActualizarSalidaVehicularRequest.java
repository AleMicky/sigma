package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request;

import jakarta.validation.constraints.Size;

import java.time.Instant;

public record ActualizarSalidaVehicularRequest(
        Instant fecha,

        @Size(max = 1000, message = "La descripción de la actividad no puede exceder 1000 caracteres")
        String descripcionActividad,

        @Size(max = 1000, message = "Las observaciones no pueden exceder 1000 caracteres")
        String observaciones
) {
}
