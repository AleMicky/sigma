package com.endecorani.sigma_api.modules.cuestionarios.application.dto.request;

import com.endecorani.sigma_api.modules.cuestionarios.domain.enums.TipoPregunta;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record PreguntaItemRequest(
        UUID id,

        @Size(max = 100, message = "La sección no puede exceder 100 caracteres")
        String seccion,

        @Min(value = 1, message = "El orden de la pregunta debe ser mayor o igual a 1")
        Integer orden,

        @NotBlank(message = "El enunciado es obligatorio")
        @Size(max = 500, message = "El enunciado no puede exceder 500 caracteres")
        String enunciado,

        @Size(max = 500, message = "La descripción de ayuda no puede exceder 500 caracteres")
        String descripcionAyuda,

        @NotNull(message = "El tipo de pregunta es obligatorio")
        TipoPregunta tipoPregunta,

        Boolean obligatoria,

        @DecimalMin(value = "0.00", message = "El peso no puede ser negativo")
        BigDecimal peso,

        Map<String, Object> configJson,

        Boolean activo,

        @Valid
        List<PreguntaOpcionItemRequest> opciones
) {}
