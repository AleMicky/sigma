package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response;

import lombok.Builder;

import java.util.List;

@Builder
public record ReporteSalidasGeneralResponse(
        long totalSalidas,
        long salidasActivas,
        long salidasFinalizadas,
        long salidasCanceladas,
        List<SalidaVehicularResponse> items
) {
}
