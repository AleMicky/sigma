package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.dashboard.GestionVehicularDashboardResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.GestionVehicularDashboardService;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/gestion-vehicular/dashboard")
@RequiredArgsConstructor
@Tag(
        name = "Gestión Vehicular - Dashboard",
        description = "Métricas, indicadores operativos y analítica de flota vehicular, viajes y combustible"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class GestionVehicularDashboardController {

    private final GestionVehicularDashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Obtener tablero consolidado e indicadores de gestión vehicular")
    public ResponseEntity<ApiResponse<GestionVehicularDashboardResponse>> obtenerDashboard(
            @RequestParam(defaultValue = "6") int meses
    ) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.obtenerDashboard(meses)));
    }
}
