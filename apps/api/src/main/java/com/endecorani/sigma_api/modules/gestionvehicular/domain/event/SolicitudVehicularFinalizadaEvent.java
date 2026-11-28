package com.endecorani.sigma_api.modules.gestionvehicular.domain.event;

import java.util.UUID;

/**
 * Evento emitido cuando una solicitud vehicular transiciona al estado FINALIZADA/FINALIZADO.
 */
public record SolicitudVehicularFinalizadaEvent(
        UUID solicitudId,
        String numeroSolicitud,
        UUID solicitanteId,
        UUID conductorId,
        String conductorNombre
) {}
