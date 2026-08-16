package com.endecorani.sigma_api.shared.application.dto.response;

import java.time.Instant;

public record AuditoriaResponse(
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) {
}