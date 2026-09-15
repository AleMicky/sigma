package com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrdenTrabajoRequest(
        @NotNull(message = "La solicitud de mantenimiento es obligatoria")
        UUID solicitudMantenimientoId,

        @NotNull(message = "El activo es obligatorio")
        UUID activoId,

        @NotNull(message = "El responsable es obligatorio")
        UUID responsableId,

        LocalDateTime fechaInicio,

        LocalDateTime fechaFin,

        @Size(max = 2000, message = "El diagnóstico no puede superar los 2000 caracteres")
        String diagnostico,

        @Size(max = 4000, message = "El trabajo realizado no puede superar los 4000 caracteres")
        String trabajoRealizado,

        @Size(max = 2000, message = "La observación no puede superar los 2000 caracteres")
        String observacion,

        @Valid
        List<OrdenTrabajoActividadRequest> actividades,

        @Valid
        List<OrdenTrabajoAdjuntoRequest> adjuntos
) {
}
