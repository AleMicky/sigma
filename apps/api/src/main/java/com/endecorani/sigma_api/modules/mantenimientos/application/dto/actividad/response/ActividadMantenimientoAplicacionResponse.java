package com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.response;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response.ChecklistItemResponse;

import java.util.List;
import java.util.UUID;

public record ActividadMantenimientoAplicacionResponse(
        UUID id,
        UUID actividadMantenimientoId,
        UUID tipoActivoId,
        UUID componenteId,
        List<ChecklistItemResponse> checklist
) {
}
