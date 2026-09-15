package com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.List;
import java.util.UUID;

public record ChecklistMantenimientoResponse(
        UUID id,
        UUID actividadMantenimientoId,
        ActividadInfo actividadMantenimiento,
        String codigo,
        String nombre,
        String descripcion,
        List<ChecklistItemResponse> items,
        AuditoriaResponse auditoria
) {
    public record ActividadInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }
}
