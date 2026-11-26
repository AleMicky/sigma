package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.AnularRegistroPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistrarLlegadaPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistrarSalidaPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.RegistroPorteriaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.ReporteBitacoraPorteriaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.RegistroPorteriaService;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.TipoMovimientoPorteria;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.pagination.SearchPageRequestDto;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import com.endecorani.sigma_api.shared.util.FlexibleLocalDateTimeParser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/porteria")
@RequiredArgsConstructor
@Tag(
        name = "Portería",
        description = "Registro ágil de salidas y llegadas en portería (guardia, empleado, hora y activos)"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class RegistroPorteriaController {

    private static final ZoneId ZONA = FlexibleLocalDateTimeParser.OPERATIONAL_ZONE;

    private final RegistroPorteriaService service;

    @PostMapping("/salidas")
    @Operation(summary = "Registrar movimiento inicial (salida o entrada) en portería con conductor, hora y vehículo")
    public ResponseEntity<ApiResponse<RegistroPorteriaResponse>> registrarSalida(
            @Valid @RequestBody RegistrarSalidaPorteriaRequest request
    ) {
        RegistroPorteriaResponse response = service.registrarSalida(request);
        String msg = response.tipoMovimiento() == TipoMovimientoPorteria.ENTRADA
                ? "Entrada en portería registrada correctamente"
                : "Salida en portería registrada correctamente";
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(msg, response));
    }

    @PostMapping("/{id}/llegada")
    @Operation(summary = "Completar un registro pendiente de portería (entrada si inició con salida, o salida si inició con entrada)")
    public ResponseEntity<ApiResponse<RegistroPorteriaResponse>> registrarLlegada(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) RegistrarLlegadaPorteriaRequest request
    ) {
        RegistroPorteriaResponse response = service.registrarLlegada(id, request);
        String msg = response.tipoMovimiento() == TipoMovimientoPorteria.ENTRADA
                ? "Salida en portería registrada correctamente"
                : "Entrada en portería registrada correctamente";
        return ResponseEntity.ok(
                ApiResponse.success(msg, response)
        );
    }

    @PostMapping("/{id}/anular")
    @Operation(summary = "Anular un registro de portería que aún se encuentra afuera")
    public ResponseEntity<ApiResponse<RegistroPorteriaResponse>> anular(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) AnularRegistroPorteriaRequest request
    ) {
        RegistroPorteriaResponse response = service.anular(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Registro de portería anulado correctamente", response)
        );
    }

    @GetMapping("/afuera")
    @Operation(summary = "Listar registros que actualmente se encuentran afuera "
            + "(administrador: todos; otros roles: solo los de su área/sección o creados por el usuario)")
    public ResponseEntity<ApiResponse<List<RegistroPorteriaResponse>>> listarAfuera() {
        return ResponseEntity.ok(ApiResponse.success(service.listarAfuera()));
    }

    @GetMapping({"/reporte", "/bitacora"})
    @Operation(summary = "Reporte completo de todos los datos registrados en portería al estilo de bitácora "
            + "(ordenado cronológicamente, con métricas consolidadas, ruta, tiempos y detalle de activos)")
    public ResponseEntity<ApiResponse<ReporteBitacoraPorteriaResponse>> reporteBitacora(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UUID empleadoId,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) UUID areaId,
            @RequestParam(required = false) UUID createdById,
            @RequestParam(required = false) Boolean esExterno,
            @RequestParam(required = false) EstadoRegistroPorteria estado,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin
    ) {
        String searchTerm = (search != null && !search.isBlank())
                ? search.trim()
                : (q != null && !q.isBlank() ? q.trim() : null);

        Instant parsedFechaDesde = parseFecha(
                fechaDesde != null && !fechaDesde.isBlank() ? fechaDesde : fechaInicio,
                "fechaDesde/fechaInicio", false
        );
        Instant parsedFechaHasta = parseFecha(
                fechaHasta != null && !fechaHasta.isBlank() ? fechaHasta : fechaFin,
                "fechaHasta/fechaFin", true
        );

        return ResponseEntity.ok(
                ApiResponse.success(service.generarReporteBitacora(
                        searchTerm,
                        empleadoId,
                        activoId,
                        areaId,
                        createdById,
                        esExterno,
                        estado,
                        parsedFechaDesde,
                        parsedFechaHasta
                ))
        );
    }

    @GetMapping(value = {"/reporte/pdf", "/bitacora/pdf"}, produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(summary = "Descargar reporte oficial en PDF de la bitácora de control de portería en formato ENDE CORANI")
    public ResponseEntity<byte[]> reporteBitacoraPdf(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UUID empleadoId,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) UUID areaId,
            @RequestParam(required = false) UUID createdById,
            @RequestParam(required = false) Boolean esExterno,
            @RequestParam(required = false) EstadoRegistroPorteria estado,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin
    ) {
        String searchTerm = (search != null && !search.isBlank())
                ? search.trim()
                : (q != null && !q.isBlank() ? q.trim() : null);

        Instant parsedFechaDesde = parseFecha(
                fechaDesde != null && !fechaDesde.isBlank() ? fechaDesde : fechaInicio,
                "fechaDesde/fechaInicio", false
        );
        Instant parsedFechaHasta = parseFecha(
                fechaHasta != null && !fechaHasta.isBlank() ? fechaHasta : fechaFin,
                "fechaHasta/fechaFin", true
        );

        byte[] pdfBytes = service.generarReporteBitacoraPdf(
                searchTerm,
                empleadoId,
                activoId,
                areaId,
                createdById,
                esExterno,
                estado,
                parsedFechaDesde,
                parsedFechaHasta
        );

        String filename = "bitacora-porteria-"
                + (activoId != null ? activoId : "todos")
                + "-"
                + LocalDate.now(ZONA)
                + ".pdf";

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

    @GetMapping
    @Operation(summary = "Listar historial de registros de portería con paginación y filtros "
            + "(administrador: todos, con filtro opcional areaId/createdById; otros roles: solo su área/sección o creados por el usuario)")
    public ResponseEntity<ApiResponse<PageResponse<RegistroPorteriaResponse>>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UUID empleadoId,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) UUID areaId,
            @RequestParam(required = false) UUID createdById,
            @RequestParam(required = false) TipoMovimientoPorteria tipoMovimiento,
            @RequestParam(required = false) EstadoRegistroPorteria estado,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @Valid @ModelAttribute SearchPageRequestDto pageRequest
    ) {
        String searchTerm = (search != null && !search.isBlank())
                ? search.trim()
                : (q != null && !q.isBlank() ? q.trim() : (pageRequest != null ? pageRequest.getSearchTerm() : null));

        Instant parsedFechaDesde = parseFecha(fechaDesde, "fechaDesde", false);
        Instant parsedFechaHasta = parseFecha(fechaHasta, "fechaHasta", true);

        PageRequestDto effectivePageRequest = pageRequest != null
                ? pageRequest.toPageRequest()
                : new PageRequestDto();

        return ResponseEntity.ok(
                ApiResponse.success(service.listar(
                        searchTerm, empleadoId, activoId, areaId, createdById, tipoMovimiento, estado, parsedFechaDesde, parsedFechaHasta, effectivePageRequest
                ))
        );
    }

    /**
     * Interpreta los filtros de fecha en la zona operacional {@code America/La_Paz}.
     * Una fecha inválida se rechaza con {@code IllegalArgumentException}, que el
     * manejador global traduce a HTTP 400; nunca se devuelve {@code null} porque
     * eso silenciaría el filtro y mostraría todos los registros.
     */
    private Instant parseFecha(String valor, String nombreParametro, boolean finDelDia) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        String s = valor.trim();
        try {
            return Instant.parse(s);
        } catch (DateTimeParseException ignored) {
        }
        try {
            return OffsetDateTime.parse(s).toInstant();
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDateTime.parse(s).atZone(ZONA).toInstant();
        } catch (DateTimeParseException ignored) {
        }
        try {
            LocalDate fecha = LocalDate.parse(s);
            return (finDelDia ? fecha.atTime(LocalTime.MAX) : fecha.atStartOfDay())
                    .atZone(ZONA)
                    .toInstant();
        } catch (DateTimeParseException ignored) {
        }
        throw new IllegalArgumentException(
                "El parámetro '%s' no tiene un formato de fecha válido".formatted(nombreParametro));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de un registro de portería por ID")
    public ResponseEntity<ApiResponse<RegistroPorteriaResponse>> obtenerPorId(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.obtenerPorId(id)));
    }
}

