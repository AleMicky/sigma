package com.endecorani.sigma_api.modules.cuestionarios.application.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ReemplazarPreguntasRequest(
        @NotNull(message = "La lista de preguntas es obligatoria")
        @Valid
        List<PreguntaItemRequest> preguntas
) {}
