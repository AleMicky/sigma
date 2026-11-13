package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record RegistroPorteriaActivoLlegadaRequest(
        @NotNull(message = "El ID del ítem es obligatorio")
        UUID itemId,

        @NotNull(message = "Debe indicar si el activo retornó")
        Boolean retornado,

        @Size(max = 500, message = "La observación de llegada no debe exceder 500 caracteres")
        String observacionLlegada
) {}

