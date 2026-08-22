package com.endecorani.sigma_api.modules.organizacion.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.dto.response.CatalogoResumenResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "GrupoAprobadorDependienteResponse",
        description = "Información de un empleado dependiente perteneciente a un grupo aprobador"
)
public record GrupoAprobadorDependienteResponse(
        UUID id,
        CatalogoResumenResponse grupoAprobadorInfo,
        EmpleadoResumenResponse empleadoInfo,
        AuditoriaResponse auditoria
) {
}
