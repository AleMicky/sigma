package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record RegistrarBitacoraRequest(
        @NotBlank(message = "El tipo de bitácora es obligatorio (ej. ACTIVIDAD, NOVEDAD, INCIDENTE)")
        @Size(max = 80, message = "El tipo no puede exceder 80 caracteres")
        String tipo,

        @NotBlank(message = "La descripción de la bitácora es obligatoria")
        @Size(max = 4000, message = "La descripción no puede exceder 4000 caracteres")
        String descripcion,

        Instant fechaHora,

        BigDecimal latitud,

        BigDecimal longitud
) {
}
