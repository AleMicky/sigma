package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response;

import java.util.UUID;

public record FlotaVehiculoFlotaInfo(
        UUID id,
        String codigo,
        String nombre
) {
}
