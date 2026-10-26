package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response;

import lombok.Builder;

import java.util.List;

@Builder
public record ReporteBitacorasActividadesIncidentesResponse(
        long totalBitacoras,
        long totalActividades,
        long totalNovedades,
        long totalIncidentes,
        List<BitacoraVehicularResponse> items
) {
}
