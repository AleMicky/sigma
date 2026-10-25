package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.CompletarMantenimientoProgramadoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.EvaluarProgramacionRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.request.ProgramacionMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.BatchEvaluacionProgramacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.EvaluacionProgramacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoHistorialResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.programacion.response.ProgramacionMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.ProgramacionMantenimientoService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({
        ApiConstants.API_V1 + "/programaciones-mantenimiento",
        ApiConstants.API_V1 + "/programacion-mantenimiento"
})
@RequiredArgsConstructor
@Tag(
        name = "Programaciones de Mantenimiento",
        description = "Administración de programaciones preventivas, evaluación de criterios e historial de ejecuciones"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ProgramacionMantenimientoController {

    private final ProgramacionMantenimientoService service;

    @PostMapping
    @Operation(
            summary = "Crear programación de mantenimiento con criterios",
            description = "Valida que haya al menos un criterio activo (R1), sin tipos duplicados (R2), y que el activo soporte kilometraje u horas de uso (R3)."
    )
    public ResponseEntity<ApiResponse<ProgramacionMantenimientoResponse>> create(
            @Valid @RequestBody ProgramacionMantenimientoRequest request
    ) {
        ProgramacionMantenimientoResponse response = service.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Programación de mantenimiento creada correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Actualizar programación de mantenimiento",
            description = "Permite actualizar el estado y los criterios de la programación respetando las reglas de negocio."
    )
    public ResponseEntity<ApiResponse<ProgramacionMantenimientoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ProgramacionMantenimientoUpdate request
    ) {
        ProgramacionMantenimientoResponse response = service.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Programación de mantenimiento actualizada correctamente", response)
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener el detalle de una programación de mantenimiento por su ID")
    public ResponseEntity<ApiResponse<ProgramacionMantenimientoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @GetMapping
    @Operation(summary = "Listar programaciones de mantenimiento con filtros y paginación")
    public ResponseEntity<ApiResponse<PageResponse<ProgramacionMantenimientoResponse>>> findAll(
            @RequestParam(required = false) UUID planMantenimientoActivoId,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findAll(planMantenimientoActivoId, activoId, activo, q, pageRequest))
        );
    }

    @GetMapping(value = "/reporte-excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @Operation(
            summary = "Exportar reporte de seguimiento de mantenimiento preventivo y telemetría a Excel",
            description = "Genera un archivo Excel con el estado actual de todas las programaciones, telemetría de odómetro/horómetro y alertas preventivas."
    )
    public ResponseEntity<byte[]> exportarReporteExcel(
            @RequestParam(required = false) UUID planMantenimientoActivoId,
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) String q
    ) {
        byte[] bytes = service.generarReporteExcel(planMantenimientoActivoId, activoId, activo, q);
        String filename = "seguimiento-mantenimiento-preventivo-" + LocalDate.now() + ".xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(bytes);
    }

    @GetMapping("/plan-activo/{planMantenimientoActivoId}")
    @Operation(summary = "Listar programaciones asociadas a una asignación de activo al plan")
    public ResponseEntity<ApiResponse<List<ProgramacionMantenimientoResponse>>> findByPlanMantenimientoActivoId(
            @PathVariable UUID planMantenimientoActivoId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.findByPlanMantenimientoActivoId(planMantenimientoActivoId))
        );
    }

    @PatchMapping("/{id}/activar")
    @Operation(summary = "Activar una programación de mantenimiento")
    public ResponseEntity<ApiResponse<ProgramacionMantenimientoResponse>> activar(
            @PathVariable UUID id
    ) {
        ProgramacionMantenimientoResponse response = service.activar(id);
        return ResponseEntity.ok(ApiResponse.success("Programación activada correctamente", response));
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(summary = "Desactivar una programación de mantenimiento")
    public ResponseEntity<ApiResponse<ProgramacionMantenimientoResponse>> desactivar(
            @PathVariable UUID id
    ) {
        ProgramacionMantenimientoResponse response = service.desactivar(id);
        return ResponseEntity.ok(ApiResponse.success("Programación desactivada correctamente", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una programación de mantenimiento")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Programación eliminada correctamente", null));
    }

    @PostMapping("/evaluar-todas")
    @Operation(
            summary = "Evaluar todas las programaciones de mantenimiento activas en lote",
            description = "Evalúa todo el parque de programaciones activas generando solicitudes preventivas para los activos que alcanzaron sus criterios de tiempo o uso."
    )
    public ResponseEntity<ApiResponse<BatchEvaluacionProgramacionResponse>> evaluarTodas() {
        BatchEvaluacionProgramacionResponse response = service.evaluarTodas();
        return ResponseEntity.ok(
                ApiResponse.success("Evaluación en lote completada exitosamente", response)
        );
    }

    @PostMapping("/{id}/evaluar")
    @Operation(
            summary = "Evaluar criterios y generar solicitud preventiva si se cumplen (Regla 4 y 6)",
            description = "Comprueba si se cumple algún criterio (tiempo, odómetro u horómetro) y genera una única solicitud de mantenimiento para esa ejecución, conservando el historial."
    )
    public ResponseEntity<ApiResponse<EvaluacionProgramacionResponse>> evaluar(
            @PathVariable UUID id,
            @RequestBody(required = false) EvaluarProgramacionRequest request
    ) {
        EvaluacionProgramacionResponse response = service.evaluarProgramacion(id, request);
        return ResponseEntity.ok(ApiResponse.success(response.mensaje(), response));
    }

    @PostMapping("/{id}/completar")
    @Operation(
            summary = "Completar mantenimiento y recalcular criterios preventivos (Regla 5 y 6)",
            description = "Toma como referencia la fecha y el uso del servicio realizado para recalcular todos los criterios de la programación, actualizando el historial."
    )
    public ResponseEntity<ApiResponse<ProgramacionMantenimientoResponse>> completar(
            @PathVariable UUID id,
            @RequestBody(required = false) CompletarMantenimientoProgramadoRequest request
    ) {
        ProgramacionMantenimientoResponse response = service.completarMantenimiento(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("Mantenimiento completado y criterios recalculados correctamente", response)
        );
    }

    @GetMapping("/{id}/historial")
    @Operation(
            summary = "Consultar el historial de ejecuciones y valores disparadores (Regla 6)",
            description = "Devuelve el registro histórico de valores que provocaron mantenimientos preventivos para esta programación."
    )
    public ResponseEntity<ApiResponse<List<ProgramacionMantenimientoHistorialResponse>>> obtenerHistorial(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.obtenerHistorial(id)));
    }
}
