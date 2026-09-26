package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record AsignacionVehicularSolicitudInfo(
        UUID id,
        String numero,
        String motivo,
        String destino,
        LocalDateTime fechaSalida,
        LocalDateTime fechaRetornoEstimada,
        String estado
) {
}
