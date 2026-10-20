package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoActivoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoActivoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response.PlanMantenimientoActivoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.PlanMantenimientoActivoService;
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
        ApiConstants.API_V1 + "/planes-mantenimiento-activos",
        ApiConstants.API_V1 + "/plan-mantenimiento-activos"
})
@RequiredArgsConstructor
@Tag(
        name = "Asignación de Activos a Planes de Mantenimiento",
        description = "Administración de activos cubiertos por planes de mantenimiento preventivo y técnico"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class PlanMantenimientoActivoController {

    private final PlanMantenimientoActivoService service;

    @PostMapping
    @Operation(
            summary = "Asignar un activo a un plan de mantenimiento",
            description = "Valida correspondencia de tipo de activo con el plan, fechaFin >= fechaInicio y evita asignaciones activas duplicadas."
    )
    public ResponseEntity<ApiResponse<PlanMantenimientoActivoResponse>> create(
            @Valid @RequestBody PlanMantenimientoActivoRequest request
    ) {
        PlanMantenimientoActivoResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Activo asignado al plan de mantenimiento correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Actualizar asignación de activo al plan",
            description = "Permite actualizar responsable, rango de fechas y estado de vigencia respetando validaciones de coherencia temporal."
    )
    public ResponseEntity<ApiResponse<PlanMantenimientoActivoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody PlanMantenimientoActivoUpdate request
    ) {
        PlanMantenimientoActivoResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Asignación de plan de mantenimiento actualizada correctamente", response)
        );
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(
            summary = "Desactivar una asignación de activo",
            description = "Desactiva la asignación para impedir la generación de nuevas solicitudes automáticas, preservando intacto el historial."
    )
    public ResponseEntity<ApiResponse<PlanMantenimientoActivoResponse>> desactivar(
            @PathVariable UUID id
    ) {
        PlanMantenimientoActivoResponse response = service.desactivar(id);
        return ResponseEntity.ok(
                ApiResponse.success("Asignación desactivada correctamente. No generará nuevas solicitudes automáticas.", response)
        );
    }

    @PatchMapping("/{id}/activar")
    @Operation(
            summary = "Reactivar una asignación de activo al plan",
            description = "Reactiva la asignación verificando que no existan otras asignaciones activas duplicadas."
    )
    public ResponseEntity<ApiResponse<PlanMantenimientoActivoResponse>> activar(
            @PathVariable UUID id
    ) {
        PlanMantenimientoActivoResponse response = service.activar(id);
        return ResponseEntity.ok(
                ApiResponse.success("Asignación reactivada correctamente", response)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener el detalle de una asignación por su ID")
    public ResponseEntity<ApiResponse<PlanMantenimientoActivoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping
    @Operation(summary = "Listar todas las asignaciones de activos a planes de forma paginada")
    public ResponseEntity<ApiResponse<PageResponse<PlanMantenimientoActivoResponse>>> listarPaginado(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listarPaginado(pageRequest))
        );
    }

    @GetMapping("/plan/{planMantenimientoId}")
    @Operation(
            summary = "Listar asignaciones de un plan de mantenimiento",
            description = "Permite listar todas las asignaciones o filtrar únicamente las asignaciones vigentes mediante el parámetro 'activo'."
    )
    public ResponseEntity<ApiResponse<List<PlanMantenimientoActivoResponse>>> findByPlan(
            @PathVariable UUID planMantenimientoId,
            @RequestParam(required = false) Boolean activo
    ) {
        List<PlanMantenimientoActivoResponse> list = activo != null
                ? service.findByPlanMantenimientoIdAndActivo(planMantenimientoId, activo)
                : service.findByPlanMantenimientoId(planMantenimientoId);
        return ResponseEntity.ok(
                ApiResponse.success(list)
        );
    }

    @GetMapping("/plan/{planMantenimientoId}/paginado")
    @Operation(summary = "Listar asignaciones de un plan de mantenimiento de forma paginada")
    public ResponseEntity<ApiResponse<PageResponse<PlanMantenimientoActivoResponse>>> listarPorPlanPaginado(
            @PathVariable UUID planMantenimientoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listarPorPlanPaginado(planMantenimientoId, pageRequest))
        );
    }

    @GetMapping("/activo/{activoId}")
    @Operation(summary = "Listar historial y planes asignados a un activo específico")
    public ResponseEntity<ApiResponse<List<PlanMantenimientoActivoResponse>>> findByActivo(
            @PathVariable UUID activoId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByActivoId(activoId))
        );
    }

    @GetMapping("/activo/{activoId}/paginado")
    @Operation(summary = "Listar planes asignados a un activo específico de forma paginada")
    public ResponseEntity<ApiResponse<PageResponse<PlanMantenimientoActivoResponse>>> listarPorActivoPaginado(
            @PathVariable UUID activoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listarPorActivoPaginado(activoId, pageRequest))
        );
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Eliminar físicamente una asignación",
            description = "Solo permite la eliminación si el activo no cuenta con órdenes de trabajo o mantenimientos ejecutados registrados."
    )
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Asignación de plan de mantenimiento eliminada correctamente")
        );
    }
}
