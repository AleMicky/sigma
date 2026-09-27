package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.controlactivo.response;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.TipoControlActivo;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ControlActivoResponse(
        UUID id,
        UUID solicitudVehicularId,
        UUID asignacionVehicularId,
        UUID activoId,
        TipoControlActivo tipo,
        UUID recibidoPorId,
        LocalDateTime fecha,
        boolean conforme,
        String observacion,
        List<ControlActivoDetalleResponse> detalles,
        AuditoriaResponse auditoria
) {
}
