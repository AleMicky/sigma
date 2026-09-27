package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.response;

import java.util.UUID;

public record ResponsableFlotaFlotaInfo(
        UUID id,
        String codigo,
        String nombre
) {
}
