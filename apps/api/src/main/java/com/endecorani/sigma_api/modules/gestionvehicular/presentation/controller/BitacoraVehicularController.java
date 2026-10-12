package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.bitacora.response.BitacoraVehicularReporteResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.BitacoraVehicularService;
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

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/bitacora-vehicular")
@RequiredArgsConstructor
@Tag(
        name = "Bitácora Vehicular",
        description = "Reportes y bitácoras consolidadas de vehículos con viajes, kilometraje y combustible"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class BitacoraVehicularController {

    private final BitacoraVehicularService service;

    @GetMapping
    @Operation(summary = "Consultar reporte de bitácora vehicular por vehículo y rango de fechas")
    public ResponseEntity<ApiResponse<BitacoraVehicularReporteResponse>> consultarBitacora(
            @RequestParam UUID activoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) UUID conductorId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.generarReporte(activoId, fechaInicio, fechaFin, conductorId))
        );
    }

    @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(summary = "Descargar reporte oficial en PDF de la bitácora vehicular en formato ENDE CORANI")
    public ResponseEntity<byte[]> descargarPdf(
            @RequestParam UUID activoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam(required = false) UUID conductorId
    ) {
        byte[] pdfBytes = service.generarReportePdf(activoId, fechaInicio, fechaFin, conductorId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(
                ContentDisposition.inline()
                        .filename("bitacora-vehicular-" + activoId + "-" + fechaInicio + ".pdf")
                        .build()
        );
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
