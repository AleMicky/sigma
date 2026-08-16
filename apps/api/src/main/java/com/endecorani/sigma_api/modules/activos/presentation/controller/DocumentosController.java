package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.request.DocumentosRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.DocumentosResponse;
import com.endecorani.sigma_api.modules.activos.application.service.DocumentosService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/documentos")
@RequiredArgsConstructor
@Tag(
        name = "Documentos",
        description = "Administración de documentos de activos"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class DocumentosController
        extends AbstractCrudController<
        DocumentosRequest,
        DocumentosResponse,
        UUID
        > {

    private final DocumentosService documentosService;

    @Override
    protected CrudService<
            DocumentosRequest,
            DocumentosResponse,
            UUID
            > service() {
        return documentosService;
    }

    @Override
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(
            summary = "Crear documento sin archivo (no permitido)",
            description = "Los documentos deben registrarse con multipart/form-data incluyendo el archivo"
    )
    public ResponseEntity<ApiResponse<DocumentosResponse>> create(
            @Valid @RequestBody DocumentosRequest request
    ) {
        throw new BusinessException(
                "DOCUMENTO_FILE_REQUIRED",
                "Los documentos deben registrarse con un archivo adjunto (multipart/form-data)"
        );
    }

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(summary = "Registrar un documento con su archivo")
    public ResponseEntity<ApiResponse<DocumentosResponse>> createWithFile(
            @RequestPart("file") MultipartFile file,
            @Valid @RequestPart("data") DocumentosRequest request
    ) {
        DocumentosResponse response = documentosService.createWithFile(request, file);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Documento creado correctamente",
                                response
                        )
                );
    }

    @GetMapping(params = {"activoId", "tipoDocumentoId"})
    @Operation(summary = "Listar documentos filtrados por activo y tipo de documento")
    public ResponseEntity<ApiResponse<PageResponse<DocumentosResponse>>> findByActivoAndTipoDocumento(
            @RequestParam UUID activoId,
            @RequestParam UUID tipoDocumentoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        documentosService.find(activoId, tipoDocumentoId, q, pageRequest)
                )
        );
    }

    @GetMapping(params = "activoId")
    @Operation(summary = "Listar documentos filtrados por activo")
    public ResponseEntity<ApiResponse<PageResponse<DocumentosResponse>>> findByActivo(
            @RequestParam UUID activoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        documentosService.find(activoId, null, q, pageRequest)
                )
        );
    }

    @GetMapping(params = "tipoDocumentoId")
    @Operation(summary = "Listar documentos filtrados por tipo de documento")
    public ResponseEntity<ApiResponse<PageResponse<DocumentosResponse>>> findByTipoDocumento(
            @RequestParam UUID tipoDocumentoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        documentosService.find(null, tipoDocumentoId, q, pageRequest)
                )
        );
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar documentos por nombre o descripción")
    public ResponseEntity<ApiResponse<PageResponse<DocumentosResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        documentosService.find(null, null, q, pageRequest)
                )
        );
    }

    @PostMapping(
            value = "/{id}/archivo",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(summary = "Reemplazar el archivo de un documento existente")
    public ResponseEntity<ApiResponse<DocumentosResponse>> replaceFile(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Archivo actualizado correctamente",
                        documentosService.replaceFile(id, file)
                )
        );
    }
}