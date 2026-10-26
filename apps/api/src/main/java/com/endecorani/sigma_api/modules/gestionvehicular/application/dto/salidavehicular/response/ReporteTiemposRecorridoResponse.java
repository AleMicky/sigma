package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response;

import lombok.Builder;

import java.util.List;

@Builder
public record ReporteTiemposRecorridoResponse(
        long totalSalidasAnalizadas,
        Double duracionPromedioHoras,
        Long duracionMinimaMinutos,
        Long duracionMaximaMinutos,
        List<ItemTiempoRecorridoResponse> items
) {
}
