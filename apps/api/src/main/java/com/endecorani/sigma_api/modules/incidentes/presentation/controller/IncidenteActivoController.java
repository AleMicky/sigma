package com.endecorani.sigma_api.modules.incidentes.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request.CancelarIncidenteRequest;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request.EjecutarAccionIncidenteRequest;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request.IncidenteActivoRequest;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.request.IncidenteActivoUpdate;
import com.endecorani.sigma_api.modules.incidentes.application.dto.incidenteactivo.response.IncidenteActivoResponse;
import com.endecorani.sigma_api.modules.incidentes.application.service.IncidenteActivoService;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowHistoryResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskActionsResponse;
import com.endecorani.sigma_api.modules.workflow.application.dto.response.WorkflowTaskResponse;
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
        "/api/incidentes",
        ApiConstants.API_V1 + "/incidentes"
})
@RequiredArgsConstructor
@Tag(
        name = "Incidentes de Activos",
        description = "Administración de incidentes y siniestros de activos e integración dinámica con Flowable"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class IncidenteActivoController {

    private final IncidenteActivoService service;

    // ==========================================
    // 1. Operaciones CRUD y Consulta
    // ==========================================

    @PostMapping
    @Operation(summary = "Registrar incidente e iniciar proceso Flowable")
    public ResponseEntity<ApiResponse<IncidenteActivoResponse>> registrar(
            @Valid @RequestBody IncidenteActivoRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Incidente registrado exitosamente",
                        service.registrar(request)
                ));
    }

    @GetMapping
    @Operation(summary = "Listar incidentes con paginación y filtros")
    public ResponseEntity<ApiResponse<PageResponse<IncidenteActivoResponse>>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tipoIncidente,
            @RequestParam(required = false) String prioridad,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) UUID activoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(search, tipoIncidente, prioridad, estado, activoId, pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle del incidente")
    public ResponseEntity<ApiResponse<IncidenteActivoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.obtenerPorId(id))
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos del incidente")
    public ResponseEntity<ApiResponse<IncidenteActivoResponse>> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody IncidenteActivoUpdate request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Incidente actualizado exitosamente",
                        service.actualizar(id, request)
                )
        );
    }

    @GetMapping("/activo/{activoId}")
    @Operation(summary = "Listar incidentes de un activo")
    public ResponseEntity<ApiResponse<List<IncidenteActivoResponse>>> listarPorActivo(
            @PathVariable UUID activoId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listarPorActivo(activoId))
        );
    }

    @PostMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar el incidente mediante Flowable")
    public ResponseEntity<ApiResponse<IncidenteActivoResponse>> cancelar(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) CancelarIncidenteRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Incidente cancelado exitosamente",
                        service.cancelar(id, request)
                )
        );
    }

    // ==========================================
    // 2. Integración Dinámica con Flowable
    // ==========================================

    @GetMapping("/{id}/tarea-actual")
    @Operation(summary = "Obtener tarea BPMN pendiente")
    public ResponseEntity<ApiResponse<WorkflowTaskResponse>> obtenerTareaActual(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.obtenerTareaActual(id))
        );
    }

    @GetMapping("/{id}/acciones")
    @Operation(summary = "Consultar acciones disponibles de la tarea BPMN")
    public ResponseEntity<ApiResponse<WorkflowTaskActionsResponse>> obtenerAcciones(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.obtenerAcciones(id))
        );
    }

    @PostMapping("/{id}/acciones/{accionId}/ejecutar")
    @Operation(summary = "Ejecutar una acción configurada en Flowable")
    public ResponseEntity<ApiResponse<IncidenteActivoResponse>> ejecutarAccion(
            @PathVariable UUID id,
            @PathVariable String accionId,
            @Valid @RequestBody(required = false) EjecutarAccionIncidenteRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Acción ejecutada exitosamente",
                        service.ejecutarAccion(id, accionId, request)
                )
        );
    }

    @GetMapping("/{id}/historial-proceso")
    @Operation(summary = "Consultar historial BPMN")
    public ResponseEntity<ApiResponse<WorkflowHistoryResponse>> obtenerHistorialProceso(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.obtenerHistorialProceso(id))
        );
    }
}
