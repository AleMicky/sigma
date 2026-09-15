package com.endecorani.sigma_api.modules.mantenimientos.application.dto.checklist.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.UUID;

public record ChecklistItemResponse(
        UUID id,
        UUID checklistMantenimientoId,
        ChecklistInfo checklistMantenimiento,
        String codigo,
        String nombre,
        String descripcion,
        UUID tipoDatoId,
        TipoDatoInfo tipoDato,
        Integer orden,
        Boolean obligatorio,
        String opciones,
        AuditoriaResponse auditoria
) {
    public record ChecklistInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }

    public record TipoDatoInfo(
            UUID id,
            String codigo,
            String nombre
    ) {
    }
}
