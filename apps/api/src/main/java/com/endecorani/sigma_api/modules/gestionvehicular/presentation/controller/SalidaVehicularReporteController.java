package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response.*;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.SalidaVehicularReporteService;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({
        "/api/reportes/salidas-vehiculares",
        ApiConstants.API_V1 + "/reportes/salidas-vehiculares"
})
@RequiredArgsConstructor
@Tag(
        name = "Reportes de Salidas Vehiculares",
        description = "Reportes analíticos de salidas vehiculares, kilometraje, conductores/empleados, tiempos y bitácoras"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class SalidaVehicularReporteController {

    private final SalidaVehicularReporteService reporteService;

    @GetMapping
    @Operation(summary = "Reporte general de salidas vehiculares")
    public ResponseEntity<ApiResponse<ReporteSalidasGeneralResponse>> reporteGeneral(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) UUID empleadoId,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(reporteService.generarReporteGeneral(search, activoId, empleadoId, estado, fechaDesde, fechaHasta))
        );
    }

    @GetMapping("/vehiculos")
    @Operation(summary = "Reporte por vehículo y kilometraje")
    public ResponseEntity<ApiResponse<List<ReporteVehiculoKilometrajeResponse>>> reporteVehiculos(
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(reporteService.generarReporteVehiculosKilometraje(activoId, fechaDesde, fechaHasta))
        );
    }

    @GetMapping("/empleados")
    @Operation(summary = "Reporte por empleado y rendimiento en salidas")
    public ResponseEntity<ApiResponse<List<ReporteEmpleadoSalidasResponse>>> reporteEmpleados(
            @RequestParam(required = false) UUID empleadoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(reporteService.generarReporteEmpleados(empleadoId, fechaDesde, fechaHasta))
        );
    }

    @GetMapping("/tiempos")
    @Operation(summary = "Reporte de duración de recorridos")
    public ResponseEntity<ApiResponse<ReporteTiemposRecorridoResponse>> reporteTiempos(
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) UUID empleadoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(reporteService.generarReporteTiempos(activoId, empleadoId, fechaDesde, fechaHasta))
        );
    }

    @GetMapping("/bitacoras")
    @Operation(summary = "Reporte de actividades e incidentes de bitácoras")
    public ResponseEntity<ApiResponse<ReporteBitacorasActividadesIncidentesResponse>> reporteBitacoras(
            @RequestParam(required = false) UUID salidaId,
            @RequestParam(required = false) UUID empleadoId,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(reporteService.generarReporteBitacoras(salidaId, empleadoId, tipo, fechaDesde, fechaHasta))
        );
    }
}
