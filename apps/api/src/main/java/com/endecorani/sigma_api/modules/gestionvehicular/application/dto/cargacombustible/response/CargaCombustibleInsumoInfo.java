package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.cargacombustible.response;

import java.util.UUID;

public record CargaCombustibleInsumoInfo(
        UUID id,
        String codigo,
        String nombre,
        String unidadMedida
) {
}
