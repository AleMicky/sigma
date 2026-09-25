package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.tiposolicitudvehicular.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.UUID;

public record TipoSolicitudVehicularResponse(
        UUID id,
        String codigo,
        String nombre,
        String descripcion,
        AuditoriaResponse auditoria
) {
}
