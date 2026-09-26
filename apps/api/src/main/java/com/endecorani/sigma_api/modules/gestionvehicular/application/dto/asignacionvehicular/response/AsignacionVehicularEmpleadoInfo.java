package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.response;

import java.util.UUID;

public record AsignacionVehicularEmpleadoInfo(
        UUID id,
        String codigo,
        String nombreCompleto,
        String cargo,
        String area
) {
}
