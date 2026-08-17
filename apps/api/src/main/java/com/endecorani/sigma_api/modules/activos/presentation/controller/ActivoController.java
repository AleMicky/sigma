package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoService;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/activos")
@RequiredArgsConstructor
@Tag(name = "Activos", description = "Administración de activos")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class ActivoController {

    private final ActivoService activoService;

    @PostMapping
    @Operation(summary = "Crear un nuevo activo")
    public ResponseEntity<ApiResponse<ActivoResponse>> create(
            @Valid @RequestBody ActivoRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                activoService.create(request)
                        )
                );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un activo existente")
    public ResponseEntity<ApiResponse<ActivoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ActivoRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        activoService.update(id, request)
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un activo por ID")
    public ResponseEntity<ApiResponse<ActivoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        activoService.findById(id)
                )
        );
    }

    @GetMapping
    @Operation(summary = "Listar activos con paginación y búsqueda opcional")
    public ResponseEntity<ApiResponse<PageResponse<ActivoResponse>>> findAll(
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        activoService.findAll(q, pageRequest)
                )
        );
    }

    @GetMapping(params = "tipoActivoId")
    @Operation(summary = "Listar activos filtrados por tipo de activo")
    public ResponseEntity<ApiResponse<PageResponse<ActivoResponse>>> findByTipoActivoId(
            @RequestParam UUID tipoActivoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        activoService.findByTipoActivoId(
                                tipoActivoId,
                                q,
                                pageRequest
                        )
                )
        );
    }

    @PostMapping(
            value = "/{id}/imagen",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(summary = "Subir o reemplazar la imagen del activo")
    public ResponseEntity<ApiResponse<ActivoResponse>> uploadImagen(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Imagen actualizada correctamente",
                        activoService.uploadImagen(id, file)
                )
        );
    }

    @DeleteMapping("/{id}/imagen")
    @Operation(summary = "Eliminar la imagen del activo")
    public ResponseEntity<ApiResponse<ActivoResponse>> deleteImagen(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Imagen eliminada correctamente",
                        activoService.deleteImagen(id)
                )
        );
    }

    @PatchMapping("/{id}/activo")
    @Operation(summary = "Activar o desactivar un activo")
    public ResponseEntity<ApiResponse<ActivoResponse>> toggleActivo(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, Boolean> body
    ) {
        Boolean activo = body != null ? body.getOrDefault("activo", Boolean.TRUE) : Boolean.TRUE;
        return ResponseEntity.ok(
                ApiResponse.success(
                        activoService.toggleActivo(id, activo)
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un activo")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        activoService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }
}
