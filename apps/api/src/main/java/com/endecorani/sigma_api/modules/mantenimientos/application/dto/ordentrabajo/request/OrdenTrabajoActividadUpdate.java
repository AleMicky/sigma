package com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrdenTrabajoActividadUpdate(
        UUID id,

        UUID ordenTrabajoId,

        UUID actividadMantenimientoId,

        @NotBlank(message = "La descripción de la actividad es obligatoria")
        @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
        String descripcion,

        boolean realizado,

        @Size(max = 1500, message = "La observación no puede superar los 1500 caracteres")
        String observacion,

        LocalDateTime fechaRealizacion,

        @Valid
        List<OrdenTrabajoActividadEvidenciaUpdate> evidencias
) {
}

