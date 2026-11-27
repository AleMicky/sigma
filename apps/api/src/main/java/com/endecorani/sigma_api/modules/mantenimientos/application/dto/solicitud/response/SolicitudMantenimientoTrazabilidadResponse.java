package com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response;

import tools.jackson.databind.annotation.JsonDeserialize;
import com.endecorani.sigma_api.shared.infrastructure.datetime.FlexibleLocalDateTimeDeserializer;
import java.time.LocalDateTime;
import java.util.UUID;

public record SolicitudMantenimientoTrazabilidadResponse(
        UUID id,
        UUID solicitudMantenimientoId,
        String estadoAnterior,
        String estadoNuevo,
        String comentario,
        UUID empleadoId,
        SolicitudMantenimientoResponse.EmpleadoInfo empleado,
        @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
        LocalDateTime fecha
) {
}
