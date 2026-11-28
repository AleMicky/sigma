package com.endecorani.sigma_api.modules.cuestionarios.application.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ResponderCuestionarioRequest(
        String comentarioGeneral,

        @NotNull(message = "La lista de respuestas es obligatoria")
        @Valid
        List<ResponderPreguntaItemRequest> respuestas
) {}
