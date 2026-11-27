package com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response;

import tools.jackson.databind.annotation.JsonDeserialize;
import com.endecorani.sigma_api.shared.infrastructure.datetime.FlexibleLocalDateTimeDeserializer;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrdenTrabajoResponse(
        UUID id,
        String numero,
        UUID solicitudMantenimientoId,
        UUID activoId,
        UUID responsableId,
        @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
        LocalDateTime fechaInicio,
        @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
        LocalDateTime fechaFin,
        String diagnostico,
        String trabajoRealizado,
        String observacion,
        List<OrdenTrabajoActividadResponse> actividades,
        List<OrdenTrabajoAdjuntoResponse> adjuntos,
        AuditoriaResponse auditoria
) {
}
