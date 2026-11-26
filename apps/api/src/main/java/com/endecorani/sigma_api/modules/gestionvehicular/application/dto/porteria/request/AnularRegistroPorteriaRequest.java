package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request;

import jakarta.validation.constraints.Size;

public record AnularRegistroPorteriaRequest(
        @Size(max = 1000, message = "El motivo de anulación no puede exceder 1000 caracteres")
        String motivo
) {}
