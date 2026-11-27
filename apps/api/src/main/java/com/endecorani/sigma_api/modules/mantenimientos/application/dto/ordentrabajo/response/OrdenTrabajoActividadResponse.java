package com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response;

import tools.jackson.databind.annotation.JsonDeserialize;
import com.endecorani.sigma_api.shared.infrastructure.datetime.FlexibleLocalDateTimeDeserializer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrdenTrabajoActividadResponse(
        UUID id,
        UUID ordenTrabajoId,
        UUID actividadMantenimientoId,
        String descripcion,
        boolean realizado,
        String observacion,
        @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
        LocalDateTime fechaRealizacion,
        List<OrdenTrabajoActividadEvidenciaResponse> evidencias
) {
}
