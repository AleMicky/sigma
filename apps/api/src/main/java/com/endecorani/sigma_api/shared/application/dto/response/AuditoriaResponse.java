package com.endecorani.sigma_api.shared.application.dto.response;

import java.time.Instant;
import java.util.UUID;

public record AuditoriaResponse(
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy,
        UUID createdById,
        UUID updatedById
) {
}