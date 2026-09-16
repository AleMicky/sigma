package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

public interface SolicitudMantenimientoResumenProjection {
    Long getTotal();

    // SolicitudesPage
    Long getBorradores();
    Long getEnRevision();
    Long getEnProceso();
    Long getFinalizadas();

    // AprobacionesPage
    Long getPorAprobar();
    Long getObservadas();
    Long getEnObservadas();
    Long getAsignadas();
    Long getEnProcesoAprobacion();

    // EncargadoMantenimientoPage
    Long getPorIniciar();
    Long getEnEjecucion();

    // SupervisorMantenimientoPage
    Long getPorRevisar();
    Long getValidadas();
    Long getTrabajoConcluido();
}
