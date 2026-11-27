package com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request;

import tools.jackson.databind.annotation.JsonDeserialize;
import com.endecorani.sigma_api.shared.infrastructure.datetime.FlexibleLocalDateDeserializer;
import com.fasterxml.jackson.annotation.JsonAlias;
import java.time.LocalDate;
import java.util.UUID;

public record PlanMantenimientoActivoUpdate(
        UUID responsableId,
        @JsonDeserialize(using = FlexibleLocalDateDeserializer.class)
        LocalDate fechaInicio,
        @JsonDeserialize(using = FlexibleLocalDateDeserializer.class)
        LocalDate fechaFin,
        @JsonAlias({"activo", "estadoActivo", "asignacionActiva"})
        Boolean estadoActivo
) {}
