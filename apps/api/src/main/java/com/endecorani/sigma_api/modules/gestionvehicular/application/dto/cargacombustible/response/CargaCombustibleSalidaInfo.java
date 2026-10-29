package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.response;

import java.util.UUID;

public record CargaCombustibleSalidaInfo(
        UUID id,
        String numero,
        String estado,
        String descripcionActividad
) {
}

