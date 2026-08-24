package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.ControlActivoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.ControlActivoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ControlActivoService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/controles-activos")
@RequiredArgsConstructor
@Tag(
        name = "Controles de Activos",
        description = "Administración de controles de activos (entrega y devolución)"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class ControlActivoController {

    private final ControlActivoService controlActivoService;

    @PostMapping
    @Operation(summary = "Crear un control de activo")
    public ResponseEntity<ApiResponse<ControlActivoResponse>> create(
            @Valid @RequestBody ControlActivoRequest request
    ) {
        ControlActivoResponse response = controlActivoService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                response
                        )
                );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un control de activo")
    public ResponseEntity<ApiResponse<ControlActivoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ControlActivoRequest request
    ) {
        ControlActivoResponse response = controlActivoService.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        response
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un control de activo por ID")
    public ResponseEntity<ApiResponse<ControlActivoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        controlActivoService.findById(id)
                )
        );
    }

    @GetMapping
    @Operation(summary = "Listar controles de activos de forma paginada")
    public ResponseEntity<ApiResponse<PageResponse<ControlActivoResponse>>> findAll(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        controlActivoService.findAll(pageRequest)
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un control de activo")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        controlActivoService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }
}
