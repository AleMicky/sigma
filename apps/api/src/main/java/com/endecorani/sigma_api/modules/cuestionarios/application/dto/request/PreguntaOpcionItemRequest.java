package com.endecorani.sigma_api.modules.cuestionarios.application.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record PreguntaOpcionItemRequest(
        UUID id,

        @Min(value = 1, message = "El orden de la opción debe ser mayor o igual a 1")
        Integer orden,

        @NotBlank(message = "La etiqueta de la opción es obligatoria")
        @Size(max = 200, message = "La etiqueta no puede exceder 200 caracteres")
        String etiqueta,

        @Size(max = 100, message = "El valor no puede exceder 100 caracteres")
        String valor,

        BigDecimal puntaje,

        Boolean activo
) {}
