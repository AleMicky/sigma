package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response;

import lombok.Builder;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Builder
public record SalidaVehicularResponse(
        UUID id,
        String numero,
        UUID activoId,
        String activoCodigo,
        String activoDescripcion,
        String placa,
        String marca,
        String modelo,
        UUID empleadoId,
        String empleadoCodigo,
        String empleadoNombre,
        String motivo,
        String origen,
        String destino,
        String estado,
        String processInstanceId,
        List<SalidaVehicularEventoResponse> eventos,
        List<BitacoraVehicularResponse> bitacoras,
        Instant createdAt,
        Instant updatedAt
) {
}
