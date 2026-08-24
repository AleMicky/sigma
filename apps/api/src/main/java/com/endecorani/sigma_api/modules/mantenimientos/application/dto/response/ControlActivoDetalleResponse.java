package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "ControlActivoDetalleResponse",
        description = "Información de detalle de control de activo"
)
public record ControlActivoDetalleResponse(
        UUID id,
        UUID controlActivoId,
        AccesorioInfo accesorio,
        Integer cantidadEsperada,
        Integer cantidadEncontrada,
        boolean conforme,
        String observacion,
        AuditoriaResponse auditoria
) {
    public record AccesorioInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }
}
