package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.response;

import lombok.Builder;

import java.util.List;

@Builder
public record BitacoraVehicularReporteResponse(
        BitacoraVehicularVehiculoInfo vehiculo,
        BitacoraVehicularPeriodoInfo periodo,
        String conductorFiltroNombre,
        BitacoraVehicularResumenResponse resumen,
        List<BitacoraVehicularItemResponse> items
) {
}
