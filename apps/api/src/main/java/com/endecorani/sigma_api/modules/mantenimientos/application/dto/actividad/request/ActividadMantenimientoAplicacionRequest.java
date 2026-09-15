package com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ActividadMantenimientoAplicacionRequest(
        UUID actividadMantenimientoId,

        @NotNull(message = "El tipo de activo es obligatorio")
        UUID tipoActivoId,

        UUID componenteId
) {
}
