package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request;

import tools.jackson.databind.annotation.JsonDeserialize;
import com.endecorani.sigma_api.shared.infrastructure.datetime.FlexibleLocalDateDeserializer;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * REQ-MANT-006: los valores son un <em>override</em> opcional de la telemetría real del activo.
 * Solo {@code ENCARGADO}/{@code ADMIN} pueden enviarlos; si faltan, el servicio consulta la telemetría.
 */
public record EvaluarProgramacionRequest(
        @NotNull(message = "La fecha de evaluación es obligatoria")
        @JsonDeserialize(using = FlexibleLocalDateDeserializer.class)
        LocalDate fechaActual,

        @PositiveOrZero(message = "El kilometraje actual no puede ser negativo")
        BigDecimal kilometrajeActual,

        @PositiveOrZero(message = "Las horas de uso actuales no pueden ser negativas")
        BigDecimal horasUsoActual,

        Boolean forzarGeneracion
) {
}
