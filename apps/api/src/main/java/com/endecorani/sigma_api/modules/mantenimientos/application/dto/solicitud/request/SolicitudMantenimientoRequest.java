package com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record SolicitudMantenimientoRequest(
        @NotNull(message = "El activo es obligatorio")
        UUID activoId,

        @NotNull(message = "El tipo de mantenimiento es obligatorio")
        UUID tipoMantenimientoId,

        String tipoFallas,

        @NotNull(message = "La prioridad es obligatoria")
        UUID prioridadId,

        @NotNull(message = "El solicitante es obligatorio")
        UUID solicitanteId,

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 150, message = "El título no puede superar los 150 caracteres")
        String titulo,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 2000, message = "La descripción no puede superar los 2000 caracteres")
        String descripcion,
        
        List<SolicitudMantenimientoAdjuntoRequest> adjuntos
) {
}
