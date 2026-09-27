package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response;

import java.util.UUID;

public record FlotaVehiculoActivoInfo(
        UUID id,
        String codigo,
        String nombre,
        String descripcion,
        String urlImagen
) {
}
