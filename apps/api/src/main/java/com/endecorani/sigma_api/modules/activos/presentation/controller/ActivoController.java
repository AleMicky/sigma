package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoResponse;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoService;
import com.endecorani.sigma_api.shared.application.crud.CrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.presentation.controller.AbstractCrudController;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
public class ActivoController
        extends AbstractCrudController<ActivoRequest, ActivoResponse, UUID> {

    private final ActivoService activoService;

    @Override
    protected CrudService<ActivoRequest, ActivoResponse, UUID> service() {
        return activoService;
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

    @GetMapping(params = {"q", "!tipoActivoId"})
    @Operation(summary = "Buscar activos por código o nombre")
    public ResponseEntity<ApiResponse<PageResponse<ActivoResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(activoService.search(q, pageRequest))
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
}
