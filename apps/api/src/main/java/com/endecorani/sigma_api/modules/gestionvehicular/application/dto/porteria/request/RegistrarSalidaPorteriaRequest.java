package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.TipoMovimientoPorteria;
import jakarta.validation.Valid;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RegistrarSalidaPorteriaRequest(
        TipoMovimientoPorteria tipoMovimiento,

        UUID empleadoId,

        Boolean esExterno,

        String personaExterna,

        String placaExterna,

        UUID origenUbicacionId,

        UUID destinoUbicacionId,

        String destinoOtro,

        Instant fechaHoraSalida,

        UUID salidaVehicularId,

        String observacionSalida,

        @Valid
        List<RegistroPorteriaActivoSalidaRequest> activos
) {}

