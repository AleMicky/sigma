package com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PlanMantenimientoActividadRequest(
        @NotNull(message = "El plan de mantenimiento es obligatorio")
        UUID planMantenimientoId,

        @NotNull(message = "La actividad de mantenimiento es obligatoria")
        UUID actividadMantenimientoAplicacionId,

        Integer orden,

        Boolean obligatorio
) {
}
