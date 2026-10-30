package com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record IncidenteActivoRequest(
        @NotNull(message = "El ID del activo es obligatorio")
        UUID activoId,

        @NotBlank(message = "El tipo de incidente es obligatorio")
        String tipoIncidente,

        @NotBlank(message = "La prioridad es obligatoria")
        String prioridad,

        String estado,

        @NotNull(message = "La fecha y hora son obligatorias")
        LocalDateTime fechaHora,

        String ubicacion,
        BigDecimal latitud,
        BigDecimal longitud,

        @NotBlank(message = "La descripción es obligatoria")
        String descripcion,

        @NotNull(message = "El empleado que reporta es obligatorio")
        UUID empleadoReportaId
) {
}

