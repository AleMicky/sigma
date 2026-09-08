package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

public interface SolicitudMantenimientoResumenProjection {

    Long getTotal();

    Long getBorradores();

    Long getEnRevision();

    Long getEnProceso();

    Long getFinalizadas();
}
