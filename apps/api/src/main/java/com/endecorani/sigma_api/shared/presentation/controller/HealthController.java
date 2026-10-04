package com.endecorani.sigma_api.shared.presentation.controller;

import com.endecorani.sigma_api.shared.application.dto.response.HealthResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@Tag(name = "Health", description = "Endpoints de verificación de estado y salud de la API")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;

    @Operation(summary = "Verificar estado de la API")
    @GetMapping({"/health", "/api/health", ApiConstants.API_V1 + "/health"})
    public ResponseEntity<HealthResponse> checkHealth() {
        Map<String, Object> details = new LinkedHashMap<>();

        boolean dbHealthy = false;
        try (Connection connection = dataSource.getConnection()) {
            dbHealthy = connection.isValid(2);
            details.put("database", dbHealthy ? "UP" : "DOWN");
        } catch (Exception e) {
            details.put("database", "DOWN (" + e.getMessage() + ")");
        }

        String overallStatus = dbHealthy ? "UP" : "DEGRADED";

        HealthResponse response = new HealthResponse(
                overallStatus,
                "sigma-api",
                Instant.now(),
                details
        );

        return ResponseEntity.ok(response);
    }
}
