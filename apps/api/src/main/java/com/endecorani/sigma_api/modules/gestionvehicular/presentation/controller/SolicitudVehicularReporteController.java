package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.solicitudvehicular.reporte.ReporteSolicitudesGeneralResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.SolicitudVehicularReporteService;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping({
        "/api/reportes/solicitudes-vehiculares",
        ApiConstants.API_V1 + "/reportes/solicitudes-vehiculares"
})
@RequiredArgsConstructor
@Tag(
        name = "Reportes de Solicitudes Vehiculares",
        description = "Reportes analíticos y consolidados de solicitudes de vehículos, asignaciones y conductores"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class SolicitudVehicularReporteController {

    private final SolicitudVehicularReporteService reporteService;

    @GetMapping
    @Operation(summary = "Reporte general consolidado de solicitudes de vehículos y asignaciones")
    public ResponseEntity<ApiResponse<ReporteSolicitudesGeneralResponse>> reporteGeneral(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) UUID solicitanteId,
            @RequestParam(required = false) UUID conductorId,
            @RequestParam(required = false) UUID tipoSolicitudVehicularId,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(reporteService.generarReporteGeneral(
                        search, activoId, solicitanteId, conductorId, tipoSolicitudVehicularId, estado, fechaDesde, fechaHasta
                ))
        );
    }

    @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(summary = "Descargar reporte oficial en PDF de solicitudes vehiculares y asignaciones en formato ENDE CORANI")
    public ResponseEntity<byte[]> reportePdf(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) UUID solicitanteId,
            @RequestParam(required = false) UUID conductorId,
            @RequestParam(required = false) UUID tipoSolicitudVehicularId,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta
    ) {
        byte[] pdfBytes = reporteService.generarReportePdf(
                search, activoId, solicitanteId, conductorId, tipoSolicitudVehicularId, estado, fechaDesde, fechaHasta
        );

        String filename = "reporte-solicitudes-vehiculares.pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.inline()
                        .filename(filename)
                        .build()
        );
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}

