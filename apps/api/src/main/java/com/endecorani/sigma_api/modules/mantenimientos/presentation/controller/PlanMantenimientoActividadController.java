package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoActividadRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.request.PlanMantenimientoActividadUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.plan.response.PlanMantenimientoActividadResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.PlanMantenimientoActividadService;
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
        ApiConstants.API_V1 + "/planes-mantenimiento-actividades",
        ApiConstants.API_V1 + "/plan-mantenimiento-actividades"
})
@RequiredArgsConstructor
@Tag(
        name = "Actividades de Planes de Mantenimiento",
        description = "Administración de las actividades técnicas asignadas a los planes de mantenimiento"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class PlanMantenimientoActividadController {

    private final PlanMantenimientoActividadService service;

    @PostMapping
    @Operation(summary = "Asignar una actividad a un plan de mantenimiento")
    public ResponseEntity<ApiResponse<PlanMantenimientoActividadResponse>> create(
            @Valid @RequestBody PlanMantenimientoActividadRequest request
    ) {
        PlanMantenimientoActividadResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Actividad asignada al plan correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar orden y obligatoriedad de una actividad en el plan")
    public ResponseEntity<ApiResponse<PlanMantenimientoActividadResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody PlanMantenimientoActividadUpdate request
    ) {
        PlanMantenimientoActividadResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Actividad del plan actualizada correctamente", response)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de una actividad de plan por su ID")
    public ResponseEntity<ApiResponse<PlanMantenimientoActividadResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findById(id))
        );
    }

    @GetMapping(params = "planMantenimientoId")
    @Operation(summary = "Listar actividades de un plan de mantenimiento de forma paginada")
    public ResponseEntity<ApiResponse<PageResponse<PlanMantenimientoActividadResponse>>> findByPlanMantenimientoId(
            @RequestParam UUID planMantenimientoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByPlanMantenimientoId(planMantenimientoId, pageRequest))
        );
    }

    @GetMapping("/plan/{planMantenimientoId}")
    @Operation(summary = "Listar todas las actividades de un plan ordenadas por secuencia de ejecución")
    public ResponseEntity<ApiResponse<List<PlanMantenimientoActividadResponse>>> listarPorPlanMantenimientoId(
            @PathVariable UUID planMantenimientoId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listarPorPlanMantenimientoId(planMantenimientoId))
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desvincular una actividad del plan de mantenimiento")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Actividad desvinculada del plan correctamente")
        );
    }
}
