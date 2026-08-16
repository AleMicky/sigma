package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.ActivoDocumentoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.ActivoDocumentoResponse;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoDocumentoService;
import com.endecorani.sigma_api.shared.application.crud.CrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.presentation.controller.AbstractCrudController;
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

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/activo-documentos")
@RequiredArgsConstructor
@Tag(name = "Activo Documentos", description = "Administración de documentos de un activo con archivos físicos")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class ActivoDocumentoController extends AbstractCrudController<ActivoDocumentoRequest, ActivoDocumentoResponse, UUID> {

    private final ActivoDocumentoService service;

    @Override
    protected CrudService<ActivoDocumentoRequest, ActivoDocumentoResponse, UUID> service() {
        return service;
    }

    @Override
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Crear documento sin archivo (no permitido)", description = "Los documentos deben registrarse con multipart/form-data incluyendo el archivo")
    public ResponseEntity<ApiResponse<ActivoDocumentoResponse>> create(@Valid @RequestBody ActivoDocumentoRequest request) {
        throw new BusinessException("DOCUMENTO_FILE_REQUIRED", "Los documentos deben registrarse con un archivo adjunto (multipart/form-data)");
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Registrar un documento con su archivo físico")
    public ResponseEntity<ApiResponse<ActivoDocumentoResponse>> createWithFile(
            @RequestPart("file") MultipartFile file,
            @Valid @RequestPart("data") ActivoDocumentoRequest request
    ) {
        ActivoDocumentoResponse response = service.createWithFile(request, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Documento creado correctamente", response));
    }

    @GetMapping(params = "activoId")
    @Operation(summary = "Listar documentos filtrados por activo")
    public ResponseEntity<ApiResponse<PageResponse<ActivoDocumentoResponse>>> findByActivoId(
            @RequestParam UUID activoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.find(activoId, null, q, pageRequest)));
    }

    @PostMapping(value = "/{id}/archivo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Reemplazar el archivo de un documento existente")
    public ResponseEntity<ApiResponse<ActivoDocumentoResponse>> replaceFile(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(ApiResponse.success("Archivo actualizado correctamente", service.replaceFile(id, file)));
    }
}
