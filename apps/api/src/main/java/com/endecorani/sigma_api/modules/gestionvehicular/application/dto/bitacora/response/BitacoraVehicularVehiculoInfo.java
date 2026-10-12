package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.response;

import lombok.Builder;

import java.util.UUID;

@Builder
public record BitacoraVehicularVehiculoInfo(
        UUID id,
        String codigo,
        String nombre,
        String placa,
        String marca,
        String modelo,
        String tipoVehiculo,
        Long kilometrajeActual,
        Long proximoMantenimientoKm
) {
}
