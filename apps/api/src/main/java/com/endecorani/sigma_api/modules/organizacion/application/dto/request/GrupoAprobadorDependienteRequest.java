package com.endecorani.sigma_api.modules.organizacion.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(
        name = "GrupoAprobadorDependienteRequest",
        description = "Datos necesarios para registrar o actualizar un dependiente dentro de un grupo aprobador"
)
public record GrupoAprobadorDependienteRequest(
        @Schema(
                description = "Identificador del empleado dependiente",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El empleado es obligatorio")
        UUID empleadoId
) {
}
