package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record RegistrarSalidaVehicularRequest(
        @NotNull(message = "El vehículo (activoId) es obligatorio")
        UUID activoId,

        UUID empleadoId,

        Instant fecha,

        @NotBlank(message = "La descripción de la actividad es obligatoria")
        @Size(max = 1000, message = "La descripción de la actividad no puede exceder 1000 caracteres")
        String descripcionActividad,

        @Size(max = 1000, message = "Las observaciones no pueden exceder 1000 caracteres")
        String observaciones
) {
}
