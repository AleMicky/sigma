package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record BitacoraVehicularResponse(
        UUID id,
        UUID salidaVehicularId,
        UUID empleadoId,
        String empleadoNombre,
        String tipo,
        Instant fechaHora,
        String descripcion,
        BigDecimal latitud,
        BigDecimal longitud,
        Instant createdAt
) {
}
