package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.SolicitudMantenimientoService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/mantenimientos/solicitudes")
@RequiredArgsConstructor
@Tag(name = "Solicitud de Mantenimiento", description = "API para gestionar las solicitudes de mantenimiento")
public class SolicitudMantenimientoController {

    private final SolicitudMantenimientoService service;

    @GetMapping
    @Operation(summary = "Listar solicitudes", description = "Obtiene una lista paginada de solicitudes con opción de búsqueda")
    public ResponseEntity<PageResponse<SolicitudMantenimientoResponse>> listar(
            @RequestParam(required = false) String search,
            @Valid PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(service.listar(search, pageRequest));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar solicitud por ID")
    public ResponseEntity<SolicitudMantenimientoResponse> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Crear solicitud de mantenimiento")
    public ResponseEntity<SolicitudMantenimientoResponse> crear(
            @Valid @RequestBody SolicitudMantenimientoRequest request
    ) {
        SolicitudMantenimientoResponse response = service.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar solicitud de mantenimiento")
    public ResponseEntity<SolicitudMantenimientoResponse> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody SolicitudMantenimientoUpdate request
    ) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar solicitud de mantenimiento")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
