package com.endecorani.sigma_api.modules.gestionvehicular.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.request.*;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.salidavehicular.response.*;
import com.endecorani.sigma_api.modules.gestionvehicular.application.service.SalidaVehicularService;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({
        "/api/salidas-vehiculares",
        ApiConstants.API_V1 + "/salidas-vehiculares"
})
@RequiredArgsConstructor
@Tag(
        name = "Salidas Vehiculares",
        description = "Gestión de salidas vehiculares, eventos, bitácoras e integración dinámica con Flowable"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class SalidaVehicularController {

    private final SalidaVehicularService service;

    // ==========================================
    // 1. Gestión de Salidas Vehiculares
    // ==========================================

    @PostMapping
    @Operation(summary = "Registrar una nueva salida e iniciar el proceso Flowable")
    public ResponseEntity<ApiResponse<SalidaVehicularResponse>> registrar(
            @Valid @RequestBody RegistrarSalidaVehicularRequest request
    ) {
        SalidaVehicularResponse response = service.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Listar salidas con filtros y paginación")
    public ResponseEntity<ApiResponse<PageResponse<SalidaVehicularResponse>>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) UUID empleadoId,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(search, activoId, empleadoId, estado, fechaDesde, fechaHasta, pageRequest))
        );
    }

    @GetMapping("/activas")
    @Operation(summary = "Consultar salidas activas")
    public ResponseEntity<ApiResponse<List<SalidaVehicularResponse>>> listarActivas() {
        return ResponseEntity.ok(ApiResponse.success(service.listarActivas()));
    }

    @GetMapping("/mis-salidas")
    @Operation(summary = "Consultar salidas del empleado autenticado")
    public ResponseEntity<ApiResponse<PageResponse<SalidaVehicularResponse>>> listarMisSalidas(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.listarMisSalidas(pageRequest)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de una salida vehicular")
    public ResponseEntity<ApiResponse<SalidaVehicularResponse>> obtenerPorId(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.obtenerPorId(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos de una salida cuando esté permitido")
    public ResponseEntity<ApiResponse<SalidaVehicularResponse>> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody ActualizarSalidaVehicularRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.actualizar(id, request)));
    }

    @PostMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar la salida mediante Flowable")
    public ResponseEntity<ApiResponse<SalidaVehicularResponse>> cancelar(
            @PathVariable UUID id,
            @Valid @RequestBody(required = false) CancelarSalidaVehicularRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.cancelar(id, request)));
    }

    // ==========================================
    // 2. Integración Dinámica con Flowable
    // ==========================================

    @GetMapping("/{id}/tarea-actual")
    @Operation(summary = "Obtener tarea BPMN pendiente")
    public ResponseEntity<ApiResponse<WorkflowTaskResponse>> obtenerTareaActual(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.obtenerTareaActual(id)));
    }

    @GetMapping("/{id}/acciones")
    @Operation(summary = "Consultar acciones disponibles de la tarea BPMN")
    public ResponseEntity<ApiResponse<WorkflowTaskActionsResponse>> obtenerAcciones(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.obtenerAcciones(id)));
    }

    @PostMapping("/{id}/acciones/{accionId}/ejecutar")
    @Operation(summary = "Ejecutar una acción configurada en Flowable y registrar evento")
    public ResponseEntity<ApiResponse<SalidaVehicularResponse>> ejecutarAccion(
            @PathVariable UUID id,
            @PathVariable String accionId,
            @Valid @RequestBody(required = false) EjecutarAccionSalidaRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.ejecutarAccion(id, accionId, request)));
    }

    @GetMapping("/{id}/historial-proceso")
    @Operation(summary = "Consultar historial BPMN")
    public ResponseEntity<ApiResponse<WorkflowHistoryResponse>> obtenerHistorialProceso(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.obtenerHistorialProceso(id)));
    }

    // ==========================================
    // 3. Eventos Vehiculares
    // ==========================================

    @GetMapping("/{id}/eventos")
    @Operation(summary = "Consultar movimientos de la salida")
    public ResponseEntity<ApiResponse<List<SalidaVehicularEventoResponse>>> listarEventos(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.listarEventos(id)));
    }

    @GetMapping("/{id}/eventos/{eventoId}")
    @Operation(summary = "Consultar detalle de un evento")
    public ResponseEntity<ApiResponse<SalidaVehicularEventoResponse>> obtenerEvento(
            @PathVariable UUID id,
            @PathVariable UUID eventoId
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.obtenerEvento(id, eventoId)));
    }

    // ==========================================
    // 4. Bitácoras Vehiculares
    // ==========================================

    @PostMapping("/{id}/bitacoras")
    @Operation(summary = "Registrar actividad, novedad o incidente")
    public ResponseEntity<ApiResponse<BitacoraVehicularResponse>> registrarBitacora(
            @PathVariable UUID id,
            @Valid @RequestBody RegistrarBitacoraRequest request
    ) {
        BitacoraVehicularResponse response = service.registrarBitacora(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @GetMapping("/{id}/bitacoras")
    @Operation(summary = "Listar bitácoras de una salida")
    public ResponseEntity<ApiResponse<List<BitacoraVehicularResponse>>> listarBitacoras(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.listarBitacoras(id)));
    }

    @GetMapping("/{id}/bitacoras/{bitacoraId}")
    @Operation(summary = "Obtener detalle de una bitácora")
    public ResponseEntity<ApiResponse<BitacoraVehicularResponse>> obtenerBitacora(
            @PathVariable UUID id,
            @PathVariable UUID bitacoraId
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.obtenerBitacora(id, bitacoraId)));
    }
}
