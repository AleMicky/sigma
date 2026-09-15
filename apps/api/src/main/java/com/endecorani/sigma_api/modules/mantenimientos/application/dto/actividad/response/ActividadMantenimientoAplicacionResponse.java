package com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.response;

import java.util.UUID;

public record ActividadMantenimientoAplicacionResponse(
        UUID id,
        UUID actividadMantenimientoId,
        UUID tipoActivoId,
        UUID componenteId
) {
}
