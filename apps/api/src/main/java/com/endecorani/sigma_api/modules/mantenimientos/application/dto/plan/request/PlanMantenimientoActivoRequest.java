package com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request;

import tools.jackson.databind.annotation.JsonDeserialize;
import com.endecorani.sigma_api.shared.infrastructure.datetime.FlexibleLocalDateDeserializer;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record PlanMantenimientoActivoRequest(
        @NotNull(message = "El plan de mantenimiento es obligatorio")
        UUID planMantenimientoId,

        @NotNull(message = "El activo es obligatorio")
        UUID activoId,

        UUID responsableId,

        @NotNull(message = "La fecha de inicio es obligatoria")
        @JsonDeserialize(using = FlexibleLocalDateDeserializer.class)
        LocalDate fechaInicio,

        @JsonDeserialize(using = FlexibleLocalDateDeserializer.class)
        LocalDate fechaFin,

        @JsonAlias({"activo", "estadoActivo", "asignacionActiva"})
        Boolean estadoActivo
) {
    public Boolean activo() {
        return estadoActivo != null ? estadoActivo : true;
    }
}
