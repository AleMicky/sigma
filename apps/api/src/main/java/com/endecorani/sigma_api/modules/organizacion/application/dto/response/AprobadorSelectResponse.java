package com.endecorani.sigma_api.modules.organizacion.application.dto.response;

import java.util.UUID;

public record AprobadorSelectResponse(
        UUID id,
        String nombreCompleto,
        String cargo
) {}