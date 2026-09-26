package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.response;

import java.util.UUID;

public record AsignacionVehicularConductorInfo(
        UUID id,
        UUID empleadoId,
        String nombreCompleto,
        String numeroLicencia,
        String categoriaLicencia
) {
}
