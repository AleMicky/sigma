package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoDocumentoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoDocumentoResumenResponse;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoDocumentoResponse;
import com.endecorani.sigma_api.modules.activos.application.service.ActivoDocumentoService;
import com.endecorani.sigma_api.modules.activos.domain.enums.DocumentoEstadoFilter;
import com.endecorani.sigma_api.shared.application.crud.CrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.pagination.SearchPageRequestDto;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
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
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/activo-documentos")
@RequiredArgsConstructor
@Tag(name = "Activo Documentos", description = "Administración de documentos de un activo con archivos físicos")
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class ActivoDocumentoController
        extends AbstractActivoOperationalCrudController<ActivoDocumentoRequest, ActivoDocumentoResponse, UUID> {

    private final ActivoDocumentoService service;

    @Override
    protected CrudService<ActivoDocumentoRequest, ActivoDocumentoResponse, UUID> service() {
        return service;
    }

    /**
     * REQ-BIZ-007: el listado genérico hereda el mapeo del CRUD base; aquí se
     * enriquecen sus criterios con los filtros específicos de documentos sin
     * alterar las rutas ni los permisos ya existentes.
     */
    @Override
    protected PageResponse<ActivoDocumentoResponse> listResponse(SearchPageRequestDto pageRequest) {
        String query = pageRequest.getSearchTerm();
        if (query == null || query.isBlank()) {
            query = requestParam("query");
        }
        return service.find(
                null,
                uuidParam("tipoDocumentoId"),
                query,
                estadoParam("estado"),
                pageRequest.toPageRequest()
        );
    }

    @GetMapping("/resumen")
    @Operation(summary = "Conteos de documentos con los mismos filtros del listado (REQ-BIZ-007)")
    public ResponseEntity<ApiResponse<ActivoDocumentoResumenResponse>> resumen(
            @RequestParam(required = false) UUID activoId,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UUID tipoDocumentoId,
            @RequestParam(required = false) String estado) {
        // El estado seleccionado filtra el listado, pero el resumen debe
        // exponer los cinco conteos para que Web pueda mostrar todos los KPIs.
        return ResponseEntity.ok(ApiResponse.success(service.resumen(
                activoId,
                tipoDocumentoId,
                query
        )));
    }

    @Override
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Crear documento sin archivo (no permitido)", description = "Los documentos deben registrarse con multipart/form-data incluyendo el archivo")
    public ResponseEntity<ApiResponse<ActivoDocumentoResponse>> create(
            @Valid @RequestBody ActivoDocumentoRequest request) {
        throw new BusinessException("DOCUMENTO_FILE_REQUIRED",
                "Los documentos deben registrarse con un archivo adjunto (multipart/form-data)");
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Registrar un documento con su archivo físico")
    public ResponseEntity<ApiResponse<ActivoDocumentoResponse>> createWithFile(
            @RequestPart("file") MultipartFile file,
            @Valid @RequestPart("data") ActivoDocumentoRequest request) {
        ActivoDocumentoResponse response = service.createWithFile(request, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Documento creado correctamente", response));
    }

    @GetMapping(params = "activoId")
    @Operation(summary = "Listar documentos filtrados por activo, tipo, texto y vigencia (REQ-BIZ-007)")
    public ResponseEntity<ApiResponse<PageResponse<ActivoDocumentoResponse>>> findByActivoId(
            @RequestParam UUID activoId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UUID tipoDocumentoId,
            @RequestParam(required = false) String estado,
            @Valid @ModelAttribute PageRequestDto pageRequest) {
        String termino = (q != null && !q.isBlank()) ? q : query;
        return ResponseEntity.ok(ApiResponse.success(service.find(
                activoId,
                tipoDocumentoId,
                termino,
                estadoParam("estado", estado),
                pageRequest
        )));
    }

    @PostMapping(value = "/{id}/archivo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Reemplazar el archivo de un documento existente")
    public ResponseEntity<ApiResponse<ActivoDocumentoResponse>> replaceFile(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity
                .ok(ApiResponse.success("Archivo actualizado correctamente", service.replaceFile(id, file)));
    }

    private static String requestParam(String name) {
        if (!(RequestContextHolder.getRequestAttributes()
                instanceof ServletRequestAttributes attributes)) {
            return null;
        }
        return attributes.getRequest().getParameter(name);
    }

    private static UUID uuidParam(String name) {
        String value = requestParam(name);
        return value == null || value.isBlank() ? null : UUID.fromString(value);
    }

    private static DocumentoEstadoFilter estadoParam(String name) {
        return estadoParam(name, requestParam(name));
    }

    private static DocumentoEstadoFilter estadoParam(String name, String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return DocumentoEstadoFilter.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new BusinessException(
                    "ESTADO_DOCUMENTO_INVALIDO",
                    "El estado '%s' no es válido. Use VIGENTE, POR_VENCER, VENCIDO o PERMANENTE"
                            .formatted(value)
            );
        }
    }
}
