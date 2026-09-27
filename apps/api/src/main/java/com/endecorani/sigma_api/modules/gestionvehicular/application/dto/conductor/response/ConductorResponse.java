package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoConductor;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.util.List;
import java.util.UUID;

public record ConductorResponse(
        UUID id,
        UUID empleadoId,
        ConductorEmpleadoInfo empleado,
        EstadoConductor estado,
        String observacion,
        boolean activo,
        List<ConductorLicenciaResponse> licencias,
        AuditoriaResponse auditoria
) {
}
