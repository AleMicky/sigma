package com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SolicitudMantenimientoUpdate(
        @NotNull(message = "El activo es obligatorio")
        UUID activoId,

        @NotNull(message = "El tipo de mantenimiento es obligatorio")
        UUID tipoMantenimientoId,

        String tipoFallas,

        @NotNull(message = "La prioridad es obligatoria")
        UUID prioridadId,

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 150, message = "El título no puede superar los 150 caracteres")
        String titulo,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 2000, message = "La descripción no puede superar los 2000 caracteres")
        String descripcion,

        // Optional fields during execution updates
        UUID aprobadorId,
        UUID responsableId,
        UUID supervisorId,
        LocalDateTime fechaInicioMantenimiento,
        LocalDateTime fechaFinMantenimiento,
        LocalDateTime fechaCierre,
        String estado,
        
        List<SolicitudMantenimientoAdjuntoUpdate> adjuntos
) {
}
