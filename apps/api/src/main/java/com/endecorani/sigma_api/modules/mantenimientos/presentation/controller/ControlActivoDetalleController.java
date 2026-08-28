package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.ControlActivoDetalleRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.ControlActivoDetalleResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ControlActivoDetalleService;
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
@RequestMapping(ApiConstants.API_V1 + "/controles-activos-detalles")
@RequiredArgsConstructor
@Tag(
        name = "Detalles de Controles de Activos",
        description = "Administración de detalles de controles de activos (accesorios)"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ControlActivoDetalleController {

    private final ControlActivoDetalleService controlActivoDetalleService;

    @PostMapping
    @Operation(summary = "Crear un detalle de control de activo")
    public ResponseEntity<ApiResponse<ControlActivoDetalleResponse>> create(
            @Valid @RequestBody ControlActivoDetalleRequest request
    ) {
        ControlActivoDetalleResponse response = controlActivoDetalleService.create(request);
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
    @Operation(summary = "Actualizar un detalle de control de activo")
    public ResponseEntity<ApiResponse<ControlActivoDetalleResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ControlActivoDetalleRequest request
    ) {
        ControlActivoDetalleResponse response = controlActivoDetalleService.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        response
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un detalle de control de activo por ID")
    public ResponseEntity<ApiResponse<ControlActivoDetalleResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        controlActivoDetalleService.findById(id)
                )
        );
    }

    @GetMapping
    @Operation(summary = "Listar detalles de controles de activos de forma paginada")
    public ResponseEntity<ApiResponse<PageResponse<ControlActivoDetalleResponse>>> findAll(
            @RequestParam(required = false) UUID controlActivoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        PageResponse<ControlActivoDetalleResponse> response =
                controlActivoId != null
                        ? controlActivoDetalleService.findAll(controlActivoId, pageRequest)
                        : controlActivoDetalleService.findAll(pageRequest);

        return ResponseEntity.ok(
                ApiResponse.success(response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un detalle de control de activo")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        controlActivoDetalleService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }
}
