package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ProgramacionTipoActivoBatchRequest(
        @NotNull(message = "El tipo de activo es obligatorio")
        UUID tipoActivoId,

        @NotNull(message = "El plan de mantenimiento es obligatorio")
        UUID planMantenimientoId,

        Boolean estadoActivo,

        @Valid
        List<ProgramacionMantenimientoCriterioRequest> criterios
) {
    public Boolean activo() {
        return estadoActivo != null ? estadoActivo : true;
    }
}

