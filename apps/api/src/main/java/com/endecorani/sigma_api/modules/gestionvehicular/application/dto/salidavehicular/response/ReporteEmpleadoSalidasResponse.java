package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response;

import lombok.Builder;

import java.util.UUID;

@Builder
public record ReporteEmpleadoSalidasResponse(
        UUID empleadoId,
        String empleadoCodigo,
        String empleadoNombre,
        String cargo,
        String area,
        long totalSalidas,
        long salidasActivas,
        long salidasFinalizadas,
        long salidasCanceladas,
        long totalBitacoras,
        long totalIncidentes
) {
}
