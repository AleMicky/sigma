package com.endecorani.sigma_api.modules.organizacion.application.dto.response;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(
        name = "ResponsabilidadResponse",
        description = "Información de una responsabilidad"
)
public record ResponsabilidadResponse(

        UUID id,
        String codigo,
        String nombre,
        String descripcion,
        AuditoriaResponse auditoria
) {
}
