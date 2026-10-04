package com.endecorani.sigma_api.shared.application.dto.response;

import java.time.Instant;
import java.util.Map;

public record HealthResponse(
        String status,
        String service,
        Instant timestamp,
        Map<String, Object> details
) {
}
