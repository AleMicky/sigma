package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RegistrarSalidaPorteriaRequest(
        @NotNull(message = "El empleado es obligatorio")
        UUID empleadoId,

        Instant fechaHoraSalida,

        UUID salidaVehicularId,

        String observacionSalida,

        @NotEmpty(message = "Debe registrar al menos un activo o ítem")
        @Valid
        List<RegistroPorteriaActivoSalidaRequest> activos
) {}

