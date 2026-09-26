package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response;

import java.util.UUID;

public record SolicitudVehicularSolicitanteInfo(
        UUID id,
        String codigo,
        String nombreCompleto,
        String cargo,
        String area
) {
}
