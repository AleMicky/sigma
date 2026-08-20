package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(
        name = "SolicitudMantenimientoRequest",
        description = "Datos necesarios para registrar una solicitud de mantenimiento"
)
public record SolicitudMantenimientoRequest(
        @Schema(
                description = "Número único de la solicitud",
                example = "SOL-2026-001",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El número de solicitud es obligatorio")
        @Size(
                min = 1,
                max = 30,
                message = "El número debe tener entre 1 y 30 caracteres"
        )
        String numero,

        @Schema(
                description = "Identificador del activo",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El activo es obligatorio")
        UUID activoId,

        @Schema(
                description = "Identificador del tipo de mantenimiento",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El tipo de mantenimiento es obligatorio")
        UUID tipoMantenimientoId,

        @Schema(
                description = "Identificador del motivo de mantenimiento",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El motivo de mantenimiento es obligatorio")
        UUID motivoMantenimientoId,

        @Schema(
                description = "Identificador de la prioridad",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "La prioridad es obligatoria")
        UUID prioridadId,

        @Schema(
                description = "Identificador del solicitante",
                example = "4e8236fc-6daa-4814-b7f7-a5d0d37383d8",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull(message = "El solicitante es obligatorio")
        UUID solicitanteId,

        @Schema(
                description = "Título de la solicitud",
                example = "Falla en motor principal",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El título es obligatorio")
        @Size(
                min = 1,
                max = 150,
                message = "El título debe tener entre 1 y 150 caracteres"
        )
        String titulo,

        @Schema(
                description = "Descripción detallada de la solicitud",
                example = "El motor presenta ruidos anormales al arrancar",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "La descripción es obligatoria")
        @Size(
                min = 1,
                max = 2000,
                message = "La descripción debe tener entre 1 y 2000 caracteres"
        )
        String descripcion,

        @Schema(
                description = "Estado de la solicitud",
                example = "PENDIENTE",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "El estado es obligatorio")
        @Size(
                min = 1,
                max = 50,
                message = "El estado debe tener entre 1 y 50 caracteres"
        )
        String estado,

        @Schema(
                description = "Fecha de la solicitud",
                example = "2026-08-17T10:30:00"
        )
        LocalDateTime fechaSolicitud
) {
}
