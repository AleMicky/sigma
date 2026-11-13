package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request;

import jakarta.validation.Valid;

import java.time.Instant;
import java.util.List;

public record RegistrarLlegadaPorteriaRequest(
        Instant fechaHoraLlegada,
        String observacionLlegada,
        @Valid List<RegistroPorteriaActivoLlegadaRequest> activos
) {}

