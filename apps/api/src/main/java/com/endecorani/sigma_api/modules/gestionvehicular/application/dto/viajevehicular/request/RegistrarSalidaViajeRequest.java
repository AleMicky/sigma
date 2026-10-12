package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.viajevehicular.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record RegistrarSalidaViajeRequest(
        LocalDateTime fechaSalidaReal,

        @NotNull(message = "El kilometraje de salida es obligatorio")
        @PositiveOrZero(message = "El kilometraje de salida no puede ser negativo")
        Long kilometrajeSalida,

        @Size(max = 1000, message = "La observación no puede superar los 1000 caracteres")
        String observacion
) {
}
