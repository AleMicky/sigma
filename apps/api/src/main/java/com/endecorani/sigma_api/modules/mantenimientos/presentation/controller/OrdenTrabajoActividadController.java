package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.OrdenTrabajoActividadRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.OrdenTrabajoActividadResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.OrdenTrabajoActividadService;
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
@RequestMapping(ApiConstants.API_V1 + "/ordenes-trabajo-actividades")
@RequiredArgsConstructor
@Tag(
        name = "Órdenes de Trabajo Actividades",
        description = "Administración de actividades de órdenes de trabajo"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class OrdenTrabajoActividadController {

    private final OrdenTrabajoActividadService service;

    @PostMapping
    @Operation(summary = "Crear una actividad de orden de trabajo")
    public ResponseEntity<ApiResponse<OrdenTrabajoActividadResponse>> create(
            @Valid @RequestBody OrdenTrabajoActividadRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                service.create(request)
                        )
                );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una actividad de orden de trabajo")
    public ResponseEntity<ApiResponse<OrdenTrabajoActividadResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody OrdenTrabajoActividadRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        service.update(id, request)
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una actividad de orden de trabajo por ID")
    public ResponseEntity<ApiResponse<OrdenTrabajoActividadResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping(params = "ordenTrabajoId")
    @Operation(summary = "Listar actividades por orden de trabajo")
    public ResponseEntity<ApiResponse<PageResponse<OrdenTrabajoActividadResponse>>> findByOrdenTrabajoId(
            @RequestParam UUID ordenTrabajoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        service.findByOrdenTrabajoId(ordenTrabajoId, pageRequest)
                )
        );
    }

    @GetMapping
    @Operation(summary = "Listar todas las actividades de órdenes de trabajo")
    public ResponseEntity<ApiResponse<PageResponse<OrdenTrabajoActividadResponse>>> findAll(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        service.findAll(pageRequest)
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una actividad de orden de trabajo")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }
}
