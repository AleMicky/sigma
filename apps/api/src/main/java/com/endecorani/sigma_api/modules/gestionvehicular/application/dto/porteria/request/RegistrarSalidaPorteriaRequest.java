package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request;

import jakarta.validation.Valid;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RegistrarSalidaPorteriaRequest(
        UUID empleadoId,

        Boolean esExterno,

        String personaExterna,

        String placaExterna,

        Instant fechaHoraSalida,

        UUID salidaVehicularId,

        String observacionSalida,

        @Valid
        List<RegistroPorteriaActivoSalidaRequest> activos
) {}

