package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehicular.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.UUID;

public record FlotaVehicularResponse(
        UUID id,
        String codigo,
        String nombre,
        String descripcion,
        boolean activo,
        AuditoriaResponse auditoria
) {
}
