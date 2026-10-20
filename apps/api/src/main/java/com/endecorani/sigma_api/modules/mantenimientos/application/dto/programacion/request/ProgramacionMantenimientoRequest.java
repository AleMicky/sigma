package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record ProgramacionMantenimientoRequest(
        @NotNull(message = "La asignación del activo al plan es obligatoria (planMantenimientoActivoId)")
        UUID planMantenimientoActivoId,

        @JsonAlias({"activo", "estadoActivo"})
        Boolean estadoActivo,

        @Valid
        List<ProgramacionMantenimientoCriterioRequest> criterios
) {
    public Boolean activo() {
        return estadoActivo != null ? estadoActivo : true;
    }
}
