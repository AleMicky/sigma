package com.endecorani.sigma_api.modules.activos.domain.repository;

/**
 * Agregación server-side de los KPIs del listado de activos (REQ-BIZ-006).
 * Los nombres de los getters coinciden con los alias de la consulta JPQL.
 */
public interface ActivoResumenProjection {

    long getTotal();

    long getDeBaja();

    long getEnMantenimiento();

    long getOperativos();
}
