package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.response;

import java.util.UUID;

public record CargaCombustibleEmpleadoInfo(
        UUID id,
        String codigo,
        String nombreCompleto,
        String cargo
) {
}
