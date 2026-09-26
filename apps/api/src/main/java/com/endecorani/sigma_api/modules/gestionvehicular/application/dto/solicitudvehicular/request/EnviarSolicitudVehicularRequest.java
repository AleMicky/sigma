package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record EnviarSolicitudVehicularRequest(
        @NotNull(message = "El aprobador es obligatorio")
        UUID aprobadorId,
        String comentario
) {
}
