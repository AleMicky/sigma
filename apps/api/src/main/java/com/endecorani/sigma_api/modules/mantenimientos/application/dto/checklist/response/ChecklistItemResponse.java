package com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.UUID;

public record ChecklistItemResponse(
        UUID id,
        UUID actividadMantenimientoAplicacionId,
        String nombre,
        String descripcion,
        Integer orden,
        AuditoriaResponse auditoria
) {
}
