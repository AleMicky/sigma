package com.endecorani.sigma_api.modules.organizacion.application.dto;

import com.endecorani.sigma_api.modules.organizacion.domain.enums.EstadoMigracion;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(
        name = "RegistroMigracionResponse",
        description = "Información de un registro de migración desde un sistema externo"
)
public record RegistroMigracionResponse(
        @Schema(
                description = "Identificador único",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID id,

        @Schema(
                description = "Sistema de origen",
                example = "SIGA"
        )
        String sistemaOrigen,

        @Schema(
                description = "Entidad migrada (Persona, Area, Cargo, Empleado, ...)",
                example = "Persona"
        )
        String entidad,

        @Schema(
                description = "Identificador del registro en el sistema de origen",
                example = "PER-12345"
        )
        String idOrigen,

        @Schema(
                description = "UUID generado en SIGMA para el registro migrado",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8"
        )
        UUID idDestino,

        @Schema(
                description = "Estado de la migración",
                example = "MIGRADO"
        )
        EstadoMigracion estado,

        @Schema(
                description = "Mensaje o error descriptivo del resultado de la migración",
                example = "Migración exitosa"
        )
        String mensaje,

        @Schema(
                description = "Fecha y hora en que se registró la migración",
                example = "2024-08-03T14:30:00Z"
        )
        Instant fechaRegistro
) {
}