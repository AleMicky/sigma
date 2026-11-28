package com.endecorani.sigma_api.modules.cuestionarios.application.dto.request;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ResponderPreguntaItemRequest(
        @NotNull(message = "El identificador de pregunta es obligatorio")
        UUID preguntaId,

        String valorTexto,

        BigDecimal valorNumerico,

        Boolean valorBooleano,

        UUID opcionId,

        List<UUID> opcionesIds
) {}
