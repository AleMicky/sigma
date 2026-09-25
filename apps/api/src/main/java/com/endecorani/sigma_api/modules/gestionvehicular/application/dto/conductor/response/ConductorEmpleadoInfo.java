package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response;

import java.util.UUID;

public record ConductorEmpleadoInfo(
        UUID id,
        String codigo,
        String nombreCompleto,
        String cargo,
        String area
) {
}
