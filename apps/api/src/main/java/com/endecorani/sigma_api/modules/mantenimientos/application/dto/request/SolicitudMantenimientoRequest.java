package com.endecorani.sigma_api.modules.mantenimientos.application.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "SolicitudMantenimientoRequest",
        description = "Datos necesarios para registrar una solicitud de mantenimiento")
public record SolicitudMantenimientoRequest(

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
                description = "Tipo de falla",
                example = "Falla en el sistema hidráulico"
        )
        @Size(
                max = 200,
                message = "El tipo de falla debe tener máximo 200 caracteres"
        )
        String tipoFallas,

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
                description = "Fecha de la solicitud",
                example = "2026-08-17T10:30:00"
        )
        LocalDateTime fechaSolicitud
) {
}
