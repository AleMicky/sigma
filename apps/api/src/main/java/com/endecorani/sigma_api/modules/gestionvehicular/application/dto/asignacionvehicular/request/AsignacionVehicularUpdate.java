package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public record AsignacionVehicularUpdate(
        @NotNull(message = "La solicitud vehicular es obligatoria")
        UUID solicitudVehicularId,

        @NotNull(message = "El activo (vehículo) es obligatorio")
        UUID activoId,

        @NotNull(message = "El conductor es obligatorio")
        UUID conductorId,

        @NotNull(message = "El empleado asignador es obligatorio")
        UUID asignadoPorId,

        LocalDateTime fechaAsignacion,

        @Size(max = 1000, message = "La observación no puede superar los 1000 caracteres")
        String observacion
) {
}
