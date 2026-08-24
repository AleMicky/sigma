package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.EnviarSolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.service.SolicitudMantenimientoService;
import com.endecorani.sigma_api.modules.workflow.application.dto.request.CompleteWorkflowTaskRequest;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/solicitudes-mantenimiento")
@RequiredArgsConstructor
@Tag(name = "Solicitudes de Mantenimiento", description = "Administración de solicitudes de mantenimiento")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class SolicitudMantenimientoController {

    private final SolicitudMantenimientoService service;

    @PostMapping
    @Operation(summary = "Registrar una solicitud de mantenimiento")
    public ResponseEntity<ApiResponse<SolicitudMantenimientoResponse>> create(
            @Valid @RequestBody SolicitudMantenimientoRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registro creado correctamente", service.create(request)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Registrar una solicitud de mantenimiento con archivos adjuntos")
    public ResponseEntity<ApiResponse<SolicitudMantenimientoResponse>> createWithFiles(
            @Valid @RequestPart("data") SolicitudMantenimientoRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registro creado correctamente", service.createWithFiles(request, files)));
    }

    @PostMapping("/{id}/enviar")
    @Operation(summary = "Enviar solicitud e iniciar flujo de trabajo")
    public ResponseEntity<ApiResponse<SolicitudMantenimientoResponse>> enviar(
            @PathVariable UUID id,
            @Valid @RequestBody EnviarSolicitudMantenimientoRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Solicitud enviada correctamente",
                        service.enviar(
                                id,
                                request
                        )
                )
        );
    }
    @PostMapping("/{id}/workflow/complete")
    public SolicitudMantenimientoResponse completarWorkflow(
            @PathVariable UUID id,
            @RequestBody CompleteWorkflowTaskRequest request
    ) {
        return service.completarWorkflow(
                id,
                request
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una solicitud de mantenimiento")
    public ResponseEntity<ApiResponse<SolicitudMantenimientoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody SolicitudMantenimientoRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Registro actualizado correctamente", service.update(id, request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una solicitud por id")
    public ResponseEntity<ApiResponse<SolicitudMantenimientoResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @GetMapping(params = "activoId")
    @Operation(summary = "Listar solicitudes por activo")
    public ResponseEntity<ApiResponse<PageResponse<SolicitudMantenimientoResponse>>> findByActivoId(
            @RequestParam UUID activoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.findByActivoId(activoId, pageRequest)));
    }

    @GetMapping(params = "estado")
    @Operation(summary = "Listar solicitudes por estado")
    public ResponseEntity<ApiResponse<PageResponse<SolicitudMantenimientoResponse>>> findByEstado(
            @RequestParam String estado,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.findByEstado(estado, pageRequest)));
    }

    @GetMapping(params = "solicitanteId")
    @Operation(summary = "Listar solicitudes por solicitante")
    public ResponseEntity<ApiResponse<PageResponse<SolicitudMantenimientoResponse>>> findBySolicitanteId(
            @RequestParam UUID solicitanteId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.findBySolicitanteId(solicitanteId, pageRequest)));
    }

    @GetMapping(params = "responsableId")
    @Operation(summary = "Listar solicitudes por responsable")
    public ResponseEntity<ApiResponse<PageResponse<SolicitudMantenimientoResponse>>> findByResponsableId(
            @RequestParam UUID responsableId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.findByResponsableId(responsableId, pageRequest)));
    }

    @GetMapping
    @Operation(summary = "Listar todas las solicitudes")
    public ResponseEntity<ApiResponse<PageResponse<SolicitudMantenimientoResponse>>> findAll(
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.findAll(q, pageRequest)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una solicitud de mantenimiento")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Registro eliminado correctamente"));
    }
}