package com.endecorani.sigma_api.modules.organizacion.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.dto.response.CatalogoResumenResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "EmpleadoResponsabilidadResponse",
        description = "Información de la asignación de una responsabilidad a un empleado"
)
public record EmpleadoResponsabilidadResponse(
        UUID id,
        EmpleadoResumenResponse empleadoInfo,
        CatalogoResumenResponse responsabilidadInfo,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        AuditoriaResponse auditoria
) {
}
