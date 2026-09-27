package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response;

import java.util.UUID;

public record SolicitudVehicularConductorInfo(
        UUID id,
        UUID empleadoId,
        String nombreCompleto,
        String numeroLicencia,
        String categoriaLicencia
) {
}
