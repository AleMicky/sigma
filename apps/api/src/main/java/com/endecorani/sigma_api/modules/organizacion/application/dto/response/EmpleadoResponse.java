package com.endecorani.sigma_api.modules.organizacion.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.dto.response.CatalogoResumenResponse;
import io.swagger.v3.oas.annotations.media.Schema;


import java.time.LocalDate;
import java.util.UUID;

@Schema(
        name = "EmpleadoResponse",
        description = "Información de un empleado con datos enriquecidos de persona, área y cargo"
)
public record EmpleadoResponse(
        UUID id,
        PersonaResumenResponse personaInfo,
        CatalogoResumenResponse areaInfo,
        CatalogoResumenResponse cargoInfo,
        String codigo,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        AuditoriaResponse auditoria
) {

}