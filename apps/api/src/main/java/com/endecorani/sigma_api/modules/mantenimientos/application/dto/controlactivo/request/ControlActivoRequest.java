package com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoControlActivo;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ControlActivoRequest(
        @NotNull(message = "La solicitud de mantenimiento es obligatoria")
        UUID solicitudMantenimientoId,

        UUID ordenTrabajoId,

        @NotNull(message = "El activo es obligatorio")
        UUID activoId,

        @NotNull(message = "El tipo de control es obligatorio")
        TipoControlActivo tipo,

        UUID entregadoPorId,

        UUID recibidoPorId,

        LocalDateTime fecha,

        boolean conforme,

        @Size(max = 500, message = "La observación no puede superar los 500 caracteres")
        String observacion,

        @Valid
        List<ControlActivoDetalleRequest> detalles
) {
}
