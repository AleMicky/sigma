package com.endecorani.sigma_api.modules.mantenimientos.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "ChecklistItemResponse",
        description = "Información de un item de checklist de mantenimiento"
)
public record ChecklistItemResponse(
        UUID id,
        ChecklistMantenimientoInfo checklistMantenimiento,
        String codigo,
        String nombre,
        String descripcion,
        TipoDatoInfo tipoDato,
        Integer orden,
        Boolean obligatorio,
        String opciones,
        AuditoriaResponse auditoria
) {
    public record ChecklistMantenimientoInfo(
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
