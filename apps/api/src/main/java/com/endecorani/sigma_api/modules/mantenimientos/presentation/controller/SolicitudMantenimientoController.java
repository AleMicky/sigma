package com.endecorani.sigma_api.modules.mantenimientos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.EnviarSolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.request.SolicitudMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoResumenResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.solicitud.response.SolicitudMantenimientoTrazabilidadResponse;
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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/solicitudes-mantenimiento")
@RequiredArgsConstructor
@Tag(name = "Solicitudes de Mantenimiento", description = "Administración de solicitudes de mantenimiento")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class SolicitudMantenimientoController {

        private final SolicitudMantenimientoService service;

        @GetMapping("/resumen")
        @Operation(summary = "Obtener resumen y conteo de solicitudes por estado")
        public ResponseEntity<ApiResponse<SolicitudMantenimientoResumenResponse>> obtenerResumen(
                        @RequestParam(value = "interfaz", required = false) String interfaz) {
                return ResponseEntity.ok(ApiResponse.success(service.obtenerResumen(interfaz)));
        }

        @PostMapping
        @Operation(summary = "Registrar una solicitud de mantenimiento")
        public ResponseEntity<ApiResponse<SolicitudMantenimientoResponse>> create(
                        @Valid @RequestBody SolicitudMantenimientoRequest request) {
                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Registro creado correctamente", service.create(request)));
        }

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @Operation(summary = "Registrar una solicitud de mantenimiento con archivos adjuntos")
        public ResponseEntity<ApiResponse<SolicitudMantenimientoResponse>> createWithFiles(
                        @Valid @RequestPart("data") SolicitudMantenimientoRequest request,
                        @RequestPart(value = "files", required = false) List<MultipartFile> files) {
                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Registro creado correctamente",
                                                service.createWithFiles(request, files)));
        }

        @PostMapping("/{id}/enviar")
        @Operation(summary = "Enviar solicitud e iniciar flujo de trabajo")
        public ResponseEntity<ApiResponse<SolicitudMantenimientoResponse>> enviar(
                        @PathVariable UUID id,
                        @Valid @RequestBody EnviarSolicitudMantenimientoRequest request) {
                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Solicitud enviada correctamente",
                                                service.enviar(
                                                                id,
                                                                request)));
        }

        @PostMapping("/{id}/workflow/complete")
        @Operation(summary = "Completar tarea de workflow para una solicitud")
        public ResponseEntity<ApiResponse<SolicitudMantenimientoResponse>> completarWorkflow(
                        @PathVariable UUID id,
                        @RequestBody CompleteWorkflowTaskRequest request) {
                return ResponseEntity.ok(
                                ApiResponse.success(
                                                "Tarea de workflow completada correctamente",
                                                service.completarWorkflow(id, request)));
        }

        @PutMapping("/{id}")
        @Operation(summary = "Actualizar una solicitud de mantenimiento")
        public ResponseEntity<ApiResponse<SolicitudMantenimientoResponse>> update(
                        @PathVariable UUID id,
                        @Valid @RequestBody SolicitudMantenimientoRequest request) {
                return ResponseEntity.ok(
                                ApiResponse.success("Registro actualizado correctamente", service.update(id, request)));
        }

        @GetMapping("/{id}")
        @Operation(summary = "Obtener una solicitud por id")
        public ResponseEntity<ApiResponse<SolicitudMantenimientoResponse>> findById(@PathVariable UUID id) {
                return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
        }

        @GetMapping("/{id}/trazabilidad")
        @Operation(summary = "Obtener historial de trazabilidad de una solicitud de mantenimiento")
        public ResponseEntity<ApiResponse<List<SolicitudMantenimientoTrazabilidadResponse>>> obtenerTrazabilidad(
                        @PathVariable UUID id) {
                return ResponseEntity.ok(ApiResponse.success(service.obtenerTrazabilidad(id)));
        }

        @GetMapping(value = "/{id}/reporte-pdf", produces = MediaType.APPLICATION_PDF_VALUE)
        @Operation(summary = "Generar reporte PDF de una solicitud de mantenimiento")
        public ResponseEntity<byte[]> generarReportePdf(@PathVariable UUID id) {
                byte[] pdfBytes = service.generarReportePdf(id);
                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDisposition(org.springframework.http.ContentDisposition.inline()
                                .filename("solicitud-mantenimiento-" + id + ".pdf")
                                .build());
                headers.setContentLength(pdfBytes.length);
                return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        }

        @GetMapping
        @Operation(summary = "Listar solicitudes con filtros combinados (búsqueda, estado, interfaz)")
        public ResponseEntity<ApiResponse<PageResponse<SolicitudMantenimientoResponse>>> findAll(
                        @RequestParam(required = false) String q,
                        @RequestParam(required = false) String estado,
                        @RequestParam(required = false) String interfaz,
                        @Valid @ModelAttribute PageRequestDto pageRequest) {
                return ResponseEntity.ok(
                                ApiResponse.success(service.findAll(q, estado, interfaz, pageRequest)));
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Eliminar una solicitud de mantenimiento")
        public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
                service.delete(id);
                return ResponseEntity.ok(ApiResponse.success("Registro eliminado correctamente"));
        }
}
