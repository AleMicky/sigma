package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

public record ConductorRequest(
        @NotNull(message = "El empleado es obligatorio")
        UUID empleadoId,

        @NotBlank(message = "El número de licencia es obligatorio")
        @Size(max = 50, message = "El número de licencia no puede superar los 50 caracteres")
        String numeroLicencia,

        @NotBlank(message = "La categoría de licencia es obligatoria")
        @Size(max = 20, message = "La categoría de licencia no puede superar los 20 caracteres")
        String categoriaLicencia,

        @NotNull(message = "La fecha de vencimiento es obligatoria")
        LocalDate fechaVencimiento,

        Boolean activo
) {
}
