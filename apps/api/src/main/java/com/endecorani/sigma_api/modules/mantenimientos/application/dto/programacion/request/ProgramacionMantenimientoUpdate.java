package com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.Valid;

import java.util.List;

public record ProgramacionMantenimientoUpdate(
        @JsonAlias({"activo", "estadoActivo"})
        Boolean estadoActivo,

        @Valid
        List<ProgramacionMantenimientoCriterioRequest> criterios
) {
    public Boolean activo() {
        return estadoActivo;
    }
}
