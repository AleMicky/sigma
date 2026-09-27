package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.UUID;

public record ResponsableFlotaResponse(
        UUID id,
        UUID flotaVehicularId,
        UUID empleadoId,
        boolean principal,
        boolean activo,
        ResponsableFlotaFlotaInfo flota,
        ResponsableFlotaEmpleadoInfo empleado,
        AuditoriaResponse auditoria
) {
}
