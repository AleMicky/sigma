package com.endecorani.sigma_api.modules.activos.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

/** REQ-BIZ-006 / REQ-BIZ-020: JSON exacto esperado por Web y Móvil para los KPIs del listado filtrado. */
@Schema(name = "ActivoResumenResponse", description = "KPIs de activos con los mismos filtros del listado")
public record ActivoResumenResponse(
        @Schema(description = "Total de activos que cumplen los filtros") long total,
        @Schema(description = "Activos de baja (activo=false o estado DE_BAJA); excluye a los demás cubos") long deBaja,
        @Schema(description = "Activos no dados de baja cuyo estado es MANTENIMIENTO") long enMantenimiento,
        @Schema(description = "KPI legado: total - deBaja - enMantenimiento (no dado de baja y sin mantenimiento)") long operativos,
        @Schema(description = "Activos no dados de baja en estado OPERATIVO") long operativo,
        @Schema(description = "Activos no dados de baja en estado RESERVA") long reserva,
        @Schema(description = "Activos no dados de baja en estado EN_VIAJE") long enViaje,
        @Schema(description = "Activos no dados de baja en estado FUERA_SERVICIO") long fueraServicio,
        @Schema(description = "Activos disponibles: operativo + reserva + enViaje") long disponibles,
        @Schema(description = "Porcentaje de disponibilidad: disponibles * 100 / total (0 cuando total=0)") double tasaDisponibilidad
) {

    /** Constructor de compatibilidad: el KPI legado se reporta como operativo/disponible. */
    public ActivoResumenResponse(long total, long deBaja, long enMantenimiento, long operativos) {
        this(
                total,
                deBaja,
                enMantenimiento,
                operativos,
                operativos,
                0,
                0,
                0,
                operativos,
                total > 0 ? operativos * 100.0 / total : 0.0
        );
    }
}
