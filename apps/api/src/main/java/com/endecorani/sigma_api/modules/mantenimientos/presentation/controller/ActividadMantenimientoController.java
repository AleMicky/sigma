package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request.ActividadMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request.ActividadMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.response.ActividadMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ActividadMantenimientoService;
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
@RequestMapping({
        ApiConstants.API_V1 + "/actividades-mantenimiento",
        ApiConstants.API_V1 + "/actividad-mantenimiento"
})
@RequiredArgsConstructor
@Tag(
        name = "Actividades de Mantenimiento",
        description = "Administración del catálogo de actividades técnicas de mantenimiento"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ActividadMantenimientoController {

    private final ActividadMantenimientoService service;

    @GetMapping
    @Operation(summary = "Listar actividades de mantenimiento con paginación y búsqueda opcional")
    public ResponseEntity<ApiResponse<PageResponse<ActividadMantenimientoResponse>>> listar(
            @RequestParam(required = false) String search,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(search, pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una actividad de mantenimiento por ID")
    public ResponseEntity<ApiResponse<ActividadMantenimientoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping("/codigo/{codigo}")
    @Operation(summary = "Obtener una actividad de mantenimiento por su código")
    public ResponseEntity<ApiResponse<ActividadMantenimientoResponse>> findByCodigo(
            @PathVariable String codigo
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByCodigo(codigo))
        );
    }

    @GetMapping("/tipo-activo/{tipoActivoId}")
    @Operation(summary = "Listar actividades aplicables a un tipo de activo")
    public ResponseEntity<ApiResponse<List<ActividadMantenimientoResponse>>> findByTipoActivoId(
            @PathVariable UUID tipoActivoId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByTipoActivoId(tipoActivoId))
        );
    }

    @PostMapping
    @Operation(summary = "Crear una nueva actividad de mantenimiento")
    public ResponseEntity<ApiResponse<ActividadMantenimientoResponse>> create(
            @Valid @RequestBody ActividadMantenimientoRequest request
    ) {
        ActividadMantenimientoResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Actividad de mantenimiento creada correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una actividad de mantenimiento existente")
    public ResponseEntity<ApiResponse<ActividadMantenimientoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ActividadMantenimientoUpdate request
    ) {
        ActividadMantenimientoResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Actividad de mantenimiento actualizada correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una actividad de mantenimiento")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Actividad de mantenimiento eliminada correctamente")
        );
    }
}
