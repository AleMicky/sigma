package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.request;

import jakarta.validation.constraints.Size;

public record SolicitudVehicularAdjuntoRequest(
        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        String descripcion
) {
}
