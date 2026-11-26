package com.endecorani.sigma_api.modules.activos.domain.repository;

/**
 * Agregación server-side de los KPIs del listado de activos (REQ-BIZ-006,
 * REQ-BIZ-020). Los nombres de los getters coinciden con los alias de la
 * consulta JPQL.
 *
 * Regla canónica: "de baja" = {@code activo = false} O
 * {@code estadoOperativo.codigo = 'DE_BAJA'} (sin distinción de mayúsculas).
 * Esa condición es excluyente: los demás cubos sólo cuentan activos no dados
 * de baja. Los seis cubos (deBaja, enMantenimiento, fueraServicio, reserva,
 * enViaje, operativo) son disjuntos y suman {@code total}.
 */
public interface ActivoResumenProjection {

    long getTotal();

    long getDeBaja();

    long getEnMantenimiento();

    /** KPI legado: no dado de baja y sin mantenimiento (puede incluir otros estados). */
    long getOperativos();

    long getOperativo();

    long getReserva();

    long getEnViaje();

    long getFueraServicio();

    long getDisponibles();

    double getTasaDisponibilidad();
}
