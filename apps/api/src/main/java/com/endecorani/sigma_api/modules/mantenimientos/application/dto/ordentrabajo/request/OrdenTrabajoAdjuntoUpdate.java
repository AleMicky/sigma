package com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record OrdenTrabajoAdjuntoUpdate(
        UUID id,

        @NotBlank(message = "El nombre del archivo es obligatorio")
        @Size(max = 255, message = "El nombre del archivo no puede superar los 255 caracteres")
        String nombreArchivo,

        @NotBlank(message = "El tipo MIME es obligatorio")
        @Size(max = 100, message = "El tipo MIME no puede superar los 100 caracteres")
        String tipoMime,

        Long tamanio,

        @NotBlank(message = "La URL es obligatoria")
        @Size(max = 1000, message = "La URL no puede superar los 1000 caracteres")
        String url,

        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres")
        String descripcion
) {
}
