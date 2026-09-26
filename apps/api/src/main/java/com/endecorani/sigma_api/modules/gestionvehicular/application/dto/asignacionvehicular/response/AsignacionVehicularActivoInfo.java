package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.response;

import java.util.UUID;

public record AsignacionVehicularActivoInfo(
        UUID id,
        String codigo,
        String nombre,
        String placa
) {
}
