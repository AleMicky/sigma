package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RegistroPorteriaResponse(
        UUID id,
        String numero,
        Boolean esExterno,
        String personaExterna,
        String placaExterna,
        UUID empleadoId,
        String empleadoNombre,
        UUID guardiaSalidaId,
        String guardiaSalidaNombre,
        UUID guardiaLlegadaId,
        String guardiaLlegadaNombre,
        UUID salidaVehicularId,
        Instant fechaHoraSalida,
        Instant fechaHoraLlegada,
        EstadoRegistroPorteria estado,
        String observacionSalida,
        String observacionLlegada,
        List<RegistroPorteriaActivoResponse> activos,
        Instant createdAt,
        Instant updatedAt
) {}

