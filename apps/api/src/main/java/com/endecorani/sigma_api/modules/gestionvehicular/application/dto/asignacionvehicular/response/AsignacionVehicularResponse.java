package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.time.LocalDateTime;
import java.util.UUID;

public record AsignacionVehicularResponse(
        UUID id,
        UUID solicitudVehicularId,
        AsignacionVehicularSolicitudInfo solicitudVehicular,
        UUID activoId,
        AsignacionVehicularActivoInfo activo,
        UUID conductorId,
        AsignacionVehicularConductorInfo conductor,
        UUID asignadoPorId,
        AsignacionVehicularEmpleadoInfo asignadoPor,
        LocalDateTime fechaAsignacion,
        String observacion,
        AuditoriaResponse auditoria
) {
}
