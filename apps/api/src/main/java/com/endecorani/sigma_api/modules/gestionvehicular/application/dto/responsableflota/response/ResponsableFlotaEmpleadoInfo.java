package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.response;

import java.util.UUID;

public record ResponsableFlotaEmpleadoInfo(
        UUID id,
        String codigo,
        String nombreCompleto,
        String cargo,
        String area
) {
}
