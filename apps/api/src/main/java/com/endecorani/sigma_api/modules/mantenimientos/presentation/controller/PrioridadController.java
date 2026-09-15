package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.prioridad.request.PrioridadRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.prioridad.request.PrioridadUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.prioridad.response.PrioridadResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.PrioridadService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/prioridades")
@RequiredArgsConstructor
@Tag(
        name = "Prioridades",
        description = "Administración de prioridades de mantenimiento"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class PrioridadController {

    private final PrioridadService service;

    @GetMapping
    @Operation(summary = "Listar prioridades con paginación y búsqueda opcional")
    public ResponseEntity<ApiResponse<PageResponse<PrioridadResponse>>> listar(
            @RequestParam(required = false) String search,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(search, pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una prioridad por ID")
    public ResponseEntity<ApiResponse<PrioridadResponse>> buscarPorId(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.buscarPorId(id))
        );
    }

    @PostMapping
    @Operation(summary = "Crear una nueva prioridad")
    public ResponseEntity<ApiResponse<PrioridadResponse>> crear(
            @Valid @RequestBody PrioridadRequest dto
    ) {
        PrioridadResponse response = service.crear(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Prioridad creada correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una prioridad existente")
    public ResponseEntity<ApiResponse<PrioridadResponse>> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody PrioridadUpdate dto
    ) {
        PrioridadResponse response = service.actualizar(id, dto);
        return ResponseEntity.ok(
                ApiResponse.success("Prioridad actualizada correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una prioridad")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable UUID id
    ) {
        service.eliminar(id);
        return ResponseEntity.ok(
                ApiResponse.success("Prioridad eliminada correctamente")
        );
    }
}