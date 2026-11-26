package com.endecorani.sigma_api.modules.activos.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/** REQ-BIZ-007: JSON exacto esperado por Web para los KPIs de documentos. */
@Schema(
        name = "ActivoDocumentoResumenResponse",
        description = "Conteos de documentos con los mismos filtros del listado"
)
public record ActivoDocumentoResumenResponse(
        long total,
        long vigentes,
        long porVencer,
        long vencidos,
        long permanentes
) {
}
