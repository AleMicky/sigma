package com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.time.LocalDate;
import java.util.UUID;

public record PlanMantenimientoActivoUpdate(
        UUID responsableId,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        @JsonAlias({"activo", "estadoActivo", "asignacionActiva"})
        Boolean estadoActivo
) {}
