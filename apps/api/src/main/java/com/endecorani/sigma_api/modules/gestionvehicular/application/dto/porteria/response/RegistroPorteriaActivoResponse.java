package com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response;

import java.util.UUID;

public record RegistroPorteriaActivoResponse(
        UUID id,
        UUID activoId,
        String activoCodigo,
        String activoNombre,
        String descripcionItem,
        Integer cantidad,
        String observacionSalida,
        Boolean retornado,
        String observacionLlegada
) {}

