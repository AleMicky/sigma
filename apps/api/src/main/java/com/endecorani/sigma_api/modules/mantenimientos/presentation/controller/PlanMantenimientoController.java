package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response.PlanMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.PlanMantenimientoService;
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
        ApiConstants.API_V1 + "/planes-mantenimiento",
        ApiConstants.API_V1 + "/plan-mantenimiento"
})
@RequiredArgsConstructor
@Tag(
        name = "Planes de Mantenimiento",
        description = "Administración de los planes de mantenimiento preventivo y técnico"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class PlanMantenimientoController {

    private final PlanMantenimientoService service;

    @GetMapping
    @Operation(summary = "Listar planes de mantenimiento con paginación, filtro por tipo de activo y búsqueda opcional")
    public ResponseEntity<ApiResponse<PageResponse<PlanMantenimientoResponse>>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UUID tipoActivoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        String searchTerm = (search != null && !search.isBlank()) ? search : q;
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(searchTerm, tipoActivoId, pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un plan de mantenimiento por su ID")
    public ResponseEntity<ApiResponse<PlanMantenimientoResponse>> buscarPorId(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.buscarPorId(id))
        );
    }

    @GetMapping("/codigo/{codigo}")
    @Operation(summary = "Obtener un plan de mantenimiento por su código")
    public ResponseEntity<ApiResponse<PlanMantenimientoResponse>> buscarPorCodigo(
            @PathVariable String codigo
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.buscarPorCodigo(codigo))
        );
    }

    @GetMapping("/tipo-activo/{tipoActivoId}")
    @Operation(summary = "Listar planes de mantenimiento asociados a un tipo de activo")
    public ResponseEntity<ApiResponse<List<PlanMantenimientoResponse>>> listarPorTipoActivoId(
            @PathVariable UUID tipoActivoId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listarPorTipoActivoId(tipoActivoId))
        );
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo plan de mantenimiento")
    public ResponseEntity<ApiResponse<PlanMantenimientoResponse>> crear(
            @Valid @RequestBody PlanMantenimientoRequest dto
    ) {
        PlanMantenimientoResponse response = service.crear(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Plan de mantenimiento creado correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un plan de mantenimiento existente")
    public ResponseEntity<ApiResponse<PlanMantenimientoResponse>> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody PlanMantenimientoUpdate dto
    ) {
        PlanMantenimientoResponse response = service.actualizar(id, dto);
        return ResponseEntity.ok(
                ApiResponse.success("Plan de mantenimiento actualizado correctamente", response)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un plan de mantenimiento")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable UUID id
    ) {
        service.eliminar(id);
        return ResponseEntity.ok(
                ApiResponse.success("Plan de mantenimiento eliminado correctamente")
        );
    }
}
