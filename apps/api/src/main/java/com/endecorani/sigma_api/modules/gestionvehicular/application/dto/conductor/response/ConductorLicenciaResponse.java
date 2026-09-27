package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoLicenciaConductor;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;

import java.time.LocalDate;
import java.util.UUID;

public record ConductorLicenciaResponse(
        UUID id,
        UUID conductorId,
        String categoriaLicencia,
        String numeroLicencia,
        LocalDate fechaEmision,
        LocalDate fechaVencimiento,
        EstadoLicenciaConductor estado,
        String nombreArchivo,
        String nombreOriginal,
        String url,
        String mimeType,
        Long size,
        String observacion,
        boolean activo,
        AuditoriaResponse auditoria
) {
}
