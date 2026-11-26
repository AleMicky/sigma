package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.reporte.TotalesGestionVehicularResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.GestionVehicularTotalesService;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * REQ-VEH-009: contrato HTTP acordado para totales server-side de reportes.
 *
 * <p>GET /api/v1/reportes/gestion-vehicular/totales?modulo=combustible|viajes
 * con los mismos filtros que el listado correspondiente, sin page/size/sort.
 * No se crea el endpoint /resumen.</p>
 */
@RestController
@RequestMapping(ApiConstants.API_V1 + "/reportes/gestion-vehicular")
@RequiredArgsConstructor
@Tag(
        name = "Reportes de Gestión Vehicular",
        description = "Totales agregados en servidor para combustion y viajes vehiculares"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize(GestionVehicularRoles.REPORTE)
public class GestionVehicularTotalesController {

    private final GestionVehicularTotalesService service;

    @GetMapping("/totales")
    @Operation(summary = "Obtener totales agregados en servidor (no calculados sobre la página actual)")
    public ResponseEntity<ApiResponse<TotalesGestionVehicularResponse>> totales(
            @Parameter(description = "Módulo a totalizar", required = true, example = "combustible")
            @RequestParam String modulo,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) UUID viajeVehicularId,
            @RequestParam(required = false) UUID salidaVehicularId,
            @RequestParam(required = false) UUID insumoId,
            @RequestParam(required = false) UUID empleadoId,
            @RequestParam(required = false) UUID asignacionVehicularId,
            @RequestParam(required = false) UUID solicitudVehicularId,
            @RequestParam(required = false) UUID conductorId,
            @RequestParam(required = false) EstadoViajeVehicular estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.obtener(
                modulo,
                search,
                activoId,
                viajeVehicularId,
                salidaVehicularId,
                insumoId,
                empleadoId,
                asignacionVehicularId,
                solicitudVehicularId,
                conductorId,
                estado,
                fechaDesde,
                fechaHasta
        )));
    }
}
