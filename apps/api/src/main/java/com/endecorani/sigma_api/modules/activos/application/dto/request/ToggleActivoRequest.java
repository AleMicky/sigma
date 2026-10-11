package com.endecorani.sigma_api.modules.activos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Solicitud para cambiar el estado activo/inactivo")
public record ToggleActivoRequest(
        @Schema(description = "Nuevo estado del registro (true: activo, false: inactivo)", example = "true")
        @NotNull(message = "El campo 'activo' es obligatorio")
        Boolean activo
) {
    public Boolean activoOrDefault() {
        return activo != null ? activo : Boolean.TRUE;
    }
}
