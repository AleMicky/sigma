package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.AnularRegistroPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistrarLlegadaPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.request.RegistrarSalidaPorteriaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.porteria.response.RegistroPorteriaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.RegistroPorteriaService;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoRegistroPorteria;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
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

    private final RegistroPorteriaService service;

    @PostMapping("/salidas")
    @Operation(summary = "Registrar salida en portería con empleado, hora y lista de activos")
    public ResponseEntity<ApiResponse<RegistroPorteriaResponse>> registrarSalida(
            @Valid @RequestBody RegistrarSalidaPorteriaRequest request
    ) {
        RegistroPorteriaResponse response = service.registrarSalida(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Salida en portería registrada correctamente", response));
    }

    @PostMapping("/{id}/llegada")
    @Operation(summary = "Registrar llegada en portería y verificar retorno de activos")
    public ResponseEntity<ApiResponse<RegistroPorteriaResponse>> registrarLlegada(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) RegistrarLlegadaPorteriaRequest request
    ) {
        RegistroPorteriaResponse response = service.registrarLlegada(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Llegada en portería registrada correctamente", response)
        );
    }

    @PostMapping("/{id}/anular")
    @Operation(summary = "Anular un registro de portería que aún se encuentra afuera")
    public ResponseEntity<ApiResponse<RegistroPorteriaResponse>> anular(
            @PathVariable UUID id,
            @RequestBody(required = false) AnularRegistroPorteriaRequest request
    ) {
        RegistroPorteriaResponse response = service.anular(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Registro de portería anulado correctamente", response)
        );
    }

    @GetMapping("/afuera")
    @Operation(summary = "Listar registros que actualmente se encuentran afuera "
            + "(administrador: todos; otros roles: solo los de su área/sección)")
    public ResponseEntity<ApiResponse<List<RegistroPorteriaResponse>>> listarAfuera() {
        return ResponseEntity.ok(ApiResponse.success(service.listarAfuera()));
    }

    @GetMapping
    @Operation(summary = "Listar historial de registros de portería con paginación y filtros "
            + "(administrador: todos, con filtro opcional areaId; otros roles: solo su área/sección)")
    public ResponseEntity<ApiResponse<PageResponse<RegistroPorteriaResponse>>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID empleadoId,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) UUID areaId,
            @RequestParam(required = false) EstadoRegistroPorteria estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant fechaHasta,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(
                        search, empleadoId, activoId, areaId, estado, fechaDesde, fechaHasta, pageRequest
                ))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de un registro de portería por ID")
    public ResponseEntity<ApiResponse<RegistroPorteriaResponse>> obtenerPorId(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.obtenerPorId(id)));
    }
}

