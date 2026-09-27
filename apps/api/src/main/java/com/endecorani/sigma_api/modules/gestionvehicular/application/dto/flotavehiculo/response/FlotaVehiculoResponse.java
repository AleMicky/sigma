package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.UUID;

public record FlotaVehiculoResponse(
        UUID id,
        UUID flotaVehicularId,
        UUID activoId,
        boolean activo,
        FlotaVehiculoFlotaInfo flota,
        FlotaVehiculoActivoInfo vehiculo,
        AuditoriaResponse auditoria
) {
}
