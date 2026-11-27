package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request;

import tools.jackson.databind.annotation.JsonDeserialize;
import com.endecorani.sigma_api.shared.infrastructure.datetime.FlexibleLocalDateDeserializer;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * REQ-MANT-005/006: {@code solicitudId} identifica la ejecución del historial que se está cerrando.
 * Kilometraje y horas son un override restringido a {@code ENCARGADO}/{@code ADMIN}; si se omiten,
 * el servicio usa la telemetría real del activo.
 */
public record CompletarMantenimientoProgramadoRequest(
        @NotNull(message = "La fecha del servicio es obligatoria")
        @JsonDeserialize(using = FlexibleLocalDateDeserializer.class)
        LocalDate fechaServicio,

        @PositiveOrZero(message = "El kilometraje del servicio no puede ser negativo")
        BigDecimal kilometrajeServicio,

        @PositiveOrZero(message = "Las horas de uso del servicio no pueden ser negativas")
        BigDecimal horasUsoServicio,

        UUID solicitudId,

        @Size(max = 500, message = "La observación no puede superar los 500 caracteres")
        String observacion
) {
}
