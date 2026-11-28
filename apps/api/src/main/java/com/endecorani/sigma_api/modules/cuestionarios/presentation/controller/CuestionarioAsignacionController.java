package com.endecorani.sigma_api.modules.cuestionarios.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.MisAsignacionesLoteRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.ResponderCuestionarioRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.AsignacionCuestionarioResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.AsignacionDetalleResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.service.CuestionarioAsignacionService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/cuestionarios/asignaciones")
@RequiredArgsConstructor
@Tag(
        name = "Asignaciones de Cuestionarios",
        description = "Evaluaciones pendientes, consulta por entidad y envío de respuestas"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("isAuthenticated()")
public class CuestionarioAsignacionController {

    private final CuestionarioAsignacionService service;

    @GetMapping("/mis-pendientes")
    @Operation(summary = "Listar evaluaciones del empleado autenticado")
    public ResponseEntity<ApiResponse<PageResponse<AsignacionCuestionarioResponse>>> listarMisPendientes(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String entidadTipo,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listarMisPendientes(pageRequest, estado, entidadTipo))
        );
    }

    @GetMapping("/por-entidad")
    @Operation(summary = "Listar asignaciones asociadas a una entidad operativa")
    public ResponseEntity<ApiResponse<List<AsignacionCuestionarioResponse>>> listarPorEntidad(
            @RequestParam String entidadTipo,
            @RequestParam UUID entidadId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listarPorEntidad(entidadTipo, entidadId))
        );
    }

    @PostMapping("/mis-asignaciones-lote")
    @Operation(summary = "Consultar en lote las asignaciones del usuario autenticado para un conjunto de entidades")
    public ResponseEntity<ApiResponse<List<AsignacionCuestionarioResponse>>> listarMisAsignacionesEnLote(
            @Valid @RequestBody MisAsignacionesLoteRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listarMisAsignacionesEnLote(request.entidadTipo(), request.entidadIds()))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener el detalle completo de una asignación y sus respuestas")
    public ResponseEntity<ApiResponse<AsignacionDetalleResponse>> obtenerDetalle(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.obtenerDetalle(id)));
    }

    @PostMapping("/{id}/responder")
    @Operation(summary = "Registrar respuestas para una evaluación asignada al usuario autenticado")
    public ResponseEntity<ApiResponse<AsignacionDetalleResponse>> responder(
            @PathVariable UUID id,
            @Valid @RequestBody ResponderCuestionarioRequest request
    ) {
        AsignacionDetalleResponse response = service.responder(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cuestionario respondido correctamente", response));
    }
}
