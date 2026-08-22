package com.endecorani.sigma_api.modules.organizacion.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.UUID;

@Schema(
        name = "GrupoAprobadorResponse",
        description = "Información de un grupo aprobador"
)
public record GrupoAprobadorResponse(
        UUID id,
        String codigo,
        String nombre,
        String descripcion,
        AuditoriaResponse auditoria
) {
}
