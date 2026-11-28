package com.endecorani.sigma_api.modules.cuestionarios.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.CuestionarioRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.request.ReemplazarPreguntasRequest;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.CuestionarioDetalleResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.CuestionarioResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.dto.response.DisparadorCatalogoResponse;
import com.endecorani.sigma_api.modules.cuestionarios.application.service.CuestionarioService;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/cuestionarios")
@RequiredArgsConstructor
@Tag(
        name = "Cuestionarios",
        description = "Administración de plantillas y preguntas parametrizables de cuestionarios"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class CuestionarioController {

    private final CuestionarioService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Listar plantillas de cuestionarios con paginación y filtros")
    public ResponseEntity<ApiResponse<PageResponse<CuestionarioResponse>>> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String moduloOrigen,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Boolean activo,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(service.listar(q, moduloOrigen, estado, activo, pageRequest))
        );
    }

    @GetMapping("/disparadores")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar catálogo de disparadores soportados para cuestionarios")
    public ResponseEntity<ApiResponse<List<DisparadorCatalogoResponse>>> disparadores() {
        return ResponseEntity.ok(ApiResponse.success(service.disparadores()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    @Operation(summary = "Obtener detalle completo de una plantilla de cuestionario")
    public ResponseEntity<ApiResponse<CuestionarioDetalleResponse>> obtenerDetalle(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.obtenerDetalle(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear una nueva plantilla de cuestionario en estado BORRADOR")
    public ResponseEntity<ApiResponse<CuestionarioDetalleResponse>> crear(
            @Valid @RequestBody CuestionarioRequest request
    ) {
        CuestionarioDetalleResponse response = service.crear(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Cuestionario creado correctamente", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar metadatos de una plantilla de cuestionario")
    public ResponseEntity<ApiResponse<CuestionarioDetalleResponse>> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody CuestionarioRequest request
    ) {
        CuestionarioDetalleResponse response = service.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cuestionario actualizado correctamente", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar una plantilla de cuestionario sin asignaciones")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Cuestionario eliminado correctamente"));
    }

    @PutMapping("/{id}/preguntas")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reemplazar atómicamente las preguntas y opciones de un cuestionario")
    public ResponseEntity<ApiResponse<CuestionarioDetalleResponse>> reemplazarPreguntas(
            @PathVariable UUID id,
            @Valid @RequestBody ReemplazarPreguntasRequest request
    ) {
        CuestionarioDetalleResponse response = service.reemplazarPreguntas(id, request);
        return ResponseEntity.ok(ApiResponse.success("Preguntas actualizadas correctamente", response));
    }

    @PostMapping("/{id}/publicar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Publicar un cuestionario para activar su disparador")
    public ResponseEntity<ApiResponse<CuestionarioDetalleResponse>> publicar(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean reemplazarActivo
    ) {
        CuestionarioDetalleResponse response = service.publicar(id, reemplazarActivo);
        return ResponseEntity.ok(ApiResponse.success("Cuestionario publicado correctamente", response));
    }

    @PostMapping("/{id}/inactivar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Inactivar un cuestionario")
    public ResponseEntity<ApiResponse<CuestionarioDetalleResponse>> inactivar(
            @PathVariable UUID id
    ) {
        CuestionarioDetalleResponse response = service.inactivar(id);
        return ResponseEntity.ok(ApiResponse.success("Cuestionario inactivado correctamente", response));
    }

    @PostMapping("/{id}/nueva-version")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Clonar el cuestionario en una nueva versión en estado BORRADOR")
    public ResponseEntity<ApiResponse<CuestionarioDetalleResponse>> crearNuevaVersion(
            @PathVariable UUID id
    ) {
        CuestionarioDetalleResponse response = service.crearNuevaVersion(id);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Nueva versión de cuestionario creada correctamente", response));
    }
}
