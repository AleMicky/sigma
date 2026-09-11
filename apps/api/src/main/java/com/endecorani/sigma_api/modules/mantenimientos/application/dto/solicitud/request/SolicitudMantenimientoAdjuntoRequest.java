package com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request;

import jakarta.validation.constraints.NotBlank;

public record SolicitudMantenimientoAdjuntoRequest(
        @NotBlank(message = "El nombre del archivo es obligatorio")
        String nombreArchivo,

        @NotBlank(message = "La URL es obligatoria")
        String url,

        String tipoContenido,
        
        Long size,
        
        String descripcion
) {
}
