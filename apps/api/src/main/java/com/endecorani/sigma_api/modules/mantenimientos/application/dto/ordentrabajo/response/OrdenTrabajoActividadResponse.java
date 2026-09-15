package com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response;

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
        LocalDateTime fechaRealizacion,
        List<OrdenTrabajoActividadEvidenciaResponse> evidencias
) {
}
