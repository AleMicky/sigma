package com.endecorani.sigma_api.modules.mantenimientos.application.dto.preventivo.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ConfiguracionPreventivaRequest(
        @NotNull(message = "Los días de anticipación son obligatorios")
        @Min(value = 1, message = "Los días de anticipación deben ser al menos 1")
        Integer diasAnticipacionAlerta,

        @NotNull(message = "El kilometraje de anticipación es obligatorio")
        @DecimalMin(value = "1.0", message = "El kilometraje de anticipación debe ser positivo")
        BigDecimal kmAnticipacionAlerta,

        @NotNull(message = "Las horas de anticipación son obligatorias")
        @DecimalMin(value = "1.0", message = "Las horas de anticipación deben ser positivas")
        BigDecimal horasAnticipacionAlerta,

        @NotNull(message = "Debe indicar si la evaluación automática está habilitada")
        Boolean evaluacionAutomaticaHabilitada,

        @NotBlank(message = "La expresión cron de evaluación es obligatoria")
        String cronEvaluacion
) {
}
