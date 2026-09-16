package com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response;

import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.SolicitudMantenimientoResumenProjection;

public record SolicitudMantenimientoResumenResponse(
        Long total,
        // SolicitudesPage
        Long borradores,
        Long enRevision,
        Long enProceso,
        Long finalizadas,
        // AprobacionesPage
        Long porAprobar,
        Long observadas,
        Long enObservadas,
        Long asignadas,
        // EncargadoMantenimientoPage
        Long porIniciar,
        Long enEjecucion,
        // SupervisorMantenimientoPage
        Long porRevisar,
        Long validadas,
        Long trabajoConcluido
) {
    public static SolicitudMantenimientoResumenResponse from(SolicitudMantenimientoResumenProjection projection) {
        return from(projection, null);
    }

    public static SolicitudMantenimientoResumenResponse from(SolicitudMantenimientoResumenProjection projection, String interfaz) {
        if (projection == null) {
            return new SolicitudMantenimientoResumenResponse(
                    0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L, 0L
            );
        }

        Long total = projection.getTotal() != null ? projection.getTotal() : 0L;
        Long borradores = projection.getBorradores() != null ? projection.getBorradores() : 0L;
        Long finalizadas = projection.getFinalizadas() != null ? projection.getFinalizadas() : 0L;

        Long porAprobar = projection.getPorAprobar() != null ? projection.getPorAprobar() : 0L;
        Long enObservadas = projection.getEnObservadas() != null ? projection.getEnObservadas() : 0L;
        Long asignadas = projection.getAsignadas() != null ? projection.getAsignadas() : 0L;

        boolean esAprobaciones = "AprobacionesPage".equalsIgnoreCase(interfaz != null ? interfaz.trim() : "");
        boolean esEncargado = "EncargadoMantenimientoPage".equalsIgnoreCase(interfaz != null ? interfaz.trim() : "");
        boolean esSupervisor = "SupervisorMantenimientoPage".equalsIgnoreCase(interfaz != null ? interfaz.trim() : "");

        Long porRevisar = projection.getPorRevisar() != null ? projection.getPorRevisar() : 0L;
        Long enRevision;
        if (esEncargado) {
            enRevision = porRevisar;
        } else {
            enRevision = projection.getEnRevision() != null ? projection.getEnRevision() : 0L;
        }

        Long observadas;
        if (esSupervisor) {
            observadas = projection.getObservadasMantenimiento() != null
                    ? projection.getObservadasMantenimiento()
                    : (projection.getObservadas() != null ? projection.getObservadas() : 0L);
        } else {
            observadas = projection.getObservadas() != null ? projection.getObservadas() : 0L;
        }

        Long enProceso;
        if (esAprobaciones) {
            enProceso = projection.getEnProcesoAprobacion() != null
                    ? projection.getEnProcesoAprobacion()
                    : (projection.getEnProceso() != null ? projection.getEnProceso() : 0L);
        } else {
            enProceso = projection.getEnProceso() != null ? projection.getEnProceso() : 0L;
        }

        Long porIniciar = projection.getPorIniciar() != null ? projection.getPorIniciar() : 0L;
        Long enEjecucion = projection.getEnEjecucion() != null ? projection.getEnEjecucion() : 0L;
        Long validadas = projection.getValidadas() != null ? projection.getValidadas() : 0L;
        Long trabajoConcluido = projection.getTrabajoConcluido() != null ? projection.getTrabajoConcluido() : 0L;

        return new SolicitudMantenimientoResumenResponse(
                total,
                borradores,
                enRevision,
                enProceso,
                finalizadas,
                porAprobar,
                observadas,
                enObservadas,
                asignadas,
                porIniciar,
                enEjecucion,
                porRevisar,
                validadas,
                trabajoConcluido
        );
    }
}
