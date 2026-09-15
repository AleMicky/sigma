package com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.response;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response.ChecklistItemResponse;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.List;
import java.util.UUID;

public record ActividadMantenimientoResponse(
        UUID id,
        String codigo,
        String nombre,
        String descripcion,
        Boolean aplicaTodosTiposActivo,
        List<ActividadMantenimientoAplicacionResponse> aplicaciones,
        List<ChecklistItemResponse> checklist,
        AuditoriaResponse auditoria
) {
}
