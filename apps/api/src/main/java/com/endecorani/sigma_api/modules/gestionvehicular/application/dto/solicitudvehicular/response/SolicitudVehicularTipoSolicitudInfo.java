package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.response;

import java.util.UUID;

public record SolicitudVehicularTipoSolicitudInfo(
        UUID id,
        String codigo,
        String nombre,
        Integer diasAnticipacion,
        Boolean requiereRespaldo,
        Boolean requiereJustificacion
) {
}
