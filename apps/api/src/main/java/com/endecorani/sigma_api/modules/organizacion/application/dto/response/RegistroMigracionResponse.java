package com.endecorani.sigma_api.modules.organizacion.application.dto.response;

import com.endecorani.sigma_api.modules.organizacion.domain.enums.EstadoMigracion;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "RegistroMigracionResponse",
        description = "Información de un registro de migración desde un sistema externo"
)
public record RegistroMigracionResponse(
        UUID id,
        String sistemaOrigen,
        String entidad,
        String idOrigen,
        UUID idDestino,
        EstadoMigracion estado,
        String mensaje,
        Instant fechaRegistro
) {
}