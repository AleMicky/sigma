package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request.ControlActivoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request.ControlActivoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.response.ControlActivoResponse;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/controles-activos")
@RequiredArgsConstructor
@Tag(
        name = "Control de Activos",
        description = "Administración de controles de activos (entrega y devolución de accesorios)"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ControlActivoController {

    private final ControlActivoService service;

    @GetMapping
    @Operation(summary = "Listar controles de activos con paginación")
    public ResponseEntity<ApiResponse<PageResponse<ControlActivoResponse>>> findAll(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findAll(pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un control de activo por ID")
    public ResponseEntity<ApiResponse<ControlActivoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping("/solicitud/{solicitudId}")
    @Operation(summary = "Listar controles de activos por solicitud de mantenimiento")
    public ResponseEntity<ApiResponse<List<ControlActivoResponse>>> findBySolicitud(
            @PathVariable UUID solicitudId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findBySolicitudMantenimientoId(solicitudId))
        );
    }

    @GetMapping("/orden-trabajo/{ordenTrabajoId}")
    @Operation(summary = "Listar controles de activos por orden de trabajo")
    public ResponseEntity<ApiResponse<List<ControlActivoResponse>>> findByOrdenTrabajo(
            @PathVariable UUID ordenTrabajoId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByOrdenTrabajoId(ordenTrabajoId))
        );
    }

    @GetMapping("/activo/{activoId}")
    @Operation(summary = "Listar controles de activos por activo")
    public ResponseEntity<ApiResponse<List<ControlActivoResponse>>> findByActivo(
            @PathVariable UUID activoId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByActivoId(activoId))
        );
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo control de activo con sus detalles")
    public ResponseEntity<ApiResponse<ControlActivoResponse>> create(
            @Valid @RequestBody ControlActivoRequest dto
    ) {
        ControlActivoResponse response = service.create(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Control de activo creado correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un control de activo existente")
    public ResponseEntity<ApiResponse<ControlActivoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ControlActivoUpdate dto
    ) {
        ControlActivoResponse response = service.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.success("Control de activo actualizado correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un control de activo")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Control de activo eliminado correctamente")
        );
    }
}
