package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.OrdenTrabajoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.OrdenTrabajoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.OrdenTrabajoService;
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
@RequestMapping(ApiConstants.API_V1 + "/ordenes-trabajo")
@RequiredArgsConstructor
@Tag(
        name = "Órdenes de Trabajo",
        description = "Administración de órdenes de trabajo"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class OrdenTrabajoController {

    private final OrdenTrabajoService ordenTrabajoService;

    @PostMapping
    @Operation(summary = "Crear una orden de trabajo")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> create(
            @Valid @RequestBody OrdenTrabajoRequest request
    ) {
        OrdenTrabajoResponse response = ordenTrabajoService.create(request);
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
    @Operation(summary = "Actualizar una orden de trabajo")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody OrdenTrabajoRequest request
    ) {
        OrdenTrabajoResponse response = ordenTrabajoService.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        response
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una orden de trabajo por ID")
    public ResponseEntity<ApiResponse<OrdenTrabajoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        ordenTrabajoService.findById(id)
                )
        );
    }

    @GetMapping
    @Operation(summary = "Listar órdenes de trabajo de forma paginada")
    public ResponseEntity<ApiResponse<PageResponse<OrdenTrabajoResponse>>> findAll(
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        ordenTrabajoService.findAll(q, pageRequest)
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una orden de trabajo")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        ordenTrabajoService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }
}
