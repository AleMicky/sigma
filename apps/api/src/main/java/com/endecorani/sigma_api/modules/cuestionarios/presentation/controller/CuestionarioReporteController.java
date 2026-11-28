package com.endecorani.sigma_api.modules.cuestionarios.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.AsignacionCuestionarioResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.CuestionarioReporteResumenResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.service.CuestionarioReporteService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/cuestionarios/reportes")
@RequiredArgsConstructor
@Tag(
        name = "Reportes de Cuestionarios",
        description = "Indicadores, promedios por pregunta/evaluado y respuestas consolidadas"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
public class CuestionarioReporteController {

    private final CuestionarioReporteService service;

    @GetMapping("/resumen")
    @Operation(summary = "Obtener resumen estadístico de un cuestionario")
    public ResponseEntity<ApiResponse<CuestionarioReporteResumenResponse>> obtenerResumen(
            @RequestParam UUID cuestionarioId,
            @RequestParam(required = false) UUID evaluadoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.obtenerResumen(cuestionarioId, evaluadoId, fechaDesde, fechaHasta))
        );
    }

    @GetMapping("/respuestas")
    @Operation(summary = "Listar respuestas paginadas de un cuestionario con respeto de anonimato")
    public ResponseEntity<ApiResponse<PageResponse<AsignacionCuestionarioResponse>>> listarRespuestas(
            @RequestParam UUID cuestionarioId,
            @RequestParam(required = false) UUID evaluadoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listarRespuestas(cuestionarioId, evaluadoId, fechaDesde, fechaHasta, pageRequest))
        );
    }
}
