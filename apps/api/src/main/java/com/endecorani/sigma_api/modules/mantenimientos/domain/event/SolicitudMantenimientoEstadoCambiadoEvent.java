package com.endecorani.sigma_api.modules.mantenimientos.domain.event;

import java.time.LocalDateTime;
import java.util.UUID;

public record SolicitudMantenimientoEstadoCambiadoEvent(
        UUID solicitudId,
        UUID activoId,
        String estadoAnterior,
        String nuevoEstado,
        LocalDateTime fechaCambio
) {
}
