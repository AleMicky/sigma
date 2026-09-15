package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request.ActividadMantenimientoAplicacionRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.response.ActividadMantenimientoAplicacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ActividadMantenimientoAplicacionService;
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
@RequestMapping({
        ApiConstants.API_V1 + "/actividades-mantenimiento-aplicaciones",
        ApiConstants.API_V1 + "/actividad-mantenimiento-aplicaciones"
})
@RequiredArgsConstructor
@Tag(
        name = "Aplicaciones de Actividades de Mantenimiento",
        description = "Administración de relaciones entre actividades de mantenimiento, tipos de activo y componentes"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ActividadMantenimientoAplicacionController {

    private final ActividadMantenimientoAplicacionService service;

    @PostMapping
    @Operation(summary = "Crear una aplicación de actividad de mantenimiento")
    public ResponseEntity<ApiResponse<ActividadMantenimientoAplicacionResponse>> create(
            @Valid @RequestBody ActividadMantenimientoAplicacionRequest request
    ) {
        ActividadMantenimientoAplicacionResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Aplicación creada correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una aplicación de actividad de mantenimiento")
    public ResponseEntity<ApiResponse<ActividadMantenimientoAplicacionResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ActividadMantenimientoAplicacionRequest request
    ) {
        ActividadMantenimientoAplicacionResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Aplicación actualizada correctamente", response)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una aplicación por ID")
    public ResponseEntity<ApiResponse<ActividadMantenimientoAplicacionResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping(params = "actividadMantenimientoId")
    @Operation(summary = "Listar aplicaciones por actividad de mantenimiento")
    public ResponseEntity<ApiResponse<PageResponse<ActividadMantenimientoAplicacionResponse>>> findByActividadMantenimientoId(
            @RequestParam UUID actividadMantenimientoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByActividadMantenimientoId(actividadMantenimientoId, pageRequest))
        );
    }

    @GetMapping
    @Operation(summary = "Listar todas las aplicaciones de forma paginada")
    public ResponseEntity<ApiResponse<PageResponse<ActividadMantenimientoAplicacionResponse>>> findAll(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findAll(pageRequest))
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una aplicación de actividad de mantenimiento")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Aplicación eliminada correctamente")
        );
    }
}
