package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record SalidaVehicularEventoResponse(
        UUID id,
        UUID salidaVehicularId,
        UUID empleadoId,
        String empleadoNombre,
        String tipoEvento,
        Instant fechaHora,
        BigDecimal kilometraje,
        BigDecimal latitud,
        BigDecimal longitud,
        String observacion,
        Instant createdAt
) {
}
