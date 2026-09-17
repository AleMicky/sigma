package com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.response;

import java.util.UUID;

public record ControlActivoDetalleResponse(
        UUID id,
        UUID controlActivoId,
        AccesorioInfo accesorio,
        Integer cantidadEsperada,
        Integer cantidadEncontrada,
        boolean conforme,
        String observacion
) {
    public record AccesorioInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }
}
