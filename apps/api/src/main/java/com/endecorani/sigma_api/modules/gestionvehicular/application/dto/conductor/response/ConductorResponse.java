package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.time.LocalDate;
import java.util.UUID;

public record ConductorResponse(
        UUID id,
        UUID empleadoId,
        String numeroLicencia,
        String categoriaLicencia,
        LocalDate fechaVencimiento,
        boolean activo,
        AuditoriaResponse auditoria
) {
}
