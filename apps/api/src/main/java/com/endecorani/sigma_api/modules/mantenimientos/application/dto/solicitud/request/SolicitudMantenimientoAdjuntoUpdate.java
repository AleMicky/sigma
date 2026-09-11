package com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record SolicitudMantenimientoAdjuntoUpdate(
        UUID id,

        @NotBlank(message = "El nombre del archivo es obligatorio")
        String nombreArchivo,

        @NotBlank(message = "La URL es obligatoria")
        String url,

        String tipoContenido,
        
        Long size,
        
        String descripcion
) {
}
