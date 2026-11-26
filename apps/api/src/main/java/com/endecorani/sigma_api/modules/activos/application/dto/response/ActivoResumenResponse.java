package com.endecorani.sigma_api.modules.activos.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/** REQ-BIZ-006: JSON exacto esperado por Web para los KPIs del listado filtrado. */
@Schema(name = "ActivoResumenResponse", description = "KPIs de activos con los mismos filtros del listado")
public record ActivoResumenResponse(
        long total,
        long deBaja,
        long enMantenimiento,
        long operativos
) {
}
