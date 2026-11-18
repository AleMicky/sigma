package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response;

import lombok.Builder;

import java.util.List;

/**
 * Respuesta consolidada del reporte de portería al estilo de bitácora.
 */
@Builder
public record ReporteBitacoraPorteriaResponse(
        String periodoTexto,
        String mes,
        Integer anio,
        Integer totalRegistros,
        Long totalInternos,
        Long totalExternos,
        Long totalAfuera,
        Long totalCompletados,
        Long totalAnulados,
        Long totalActivosMovilizados,
        Long totalActivosNoRetornados,
        Double duracionPromedioMinutos,
        List<BitacoraPorteriaItemResponse> items
) {
}
