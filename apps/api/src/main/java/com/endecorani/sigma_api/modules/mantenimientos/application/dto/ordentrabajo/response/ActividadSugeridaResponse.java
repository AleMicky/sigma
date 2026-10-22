package com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response;

import java.util.List;
import java.util.UUID;

public record ActividadSugeridaResponse(
        UUID actividadMantenimientoId,
        UUID actividadMantenimientoAplicacionId,
        String codigo,
        String nombre,
        String descripcion,
        Integer orden,
        List<ChecklistItemSugerido> checklist
) {
    public record ChecklistItemSugerido(
            UUID id,
            String nombre,
            String descripcion,
            Integer orden
    ) {
    }
}
