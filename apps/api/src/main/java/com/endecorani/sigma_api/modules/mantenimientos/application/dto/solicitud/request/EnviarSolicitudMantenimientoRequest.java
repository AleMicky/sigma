package com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request;

import java.util.UUID;

public record EnviarSolicitudMantenimientoRequest(
        UUID aprobadorId,
        UUID responsableId,
        UUID supervisorId
) {
}
