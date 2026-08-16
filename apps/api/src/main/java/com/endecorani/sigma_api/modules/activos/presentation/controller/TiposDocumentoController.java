package com.endecorani.sigma_api.modules.activos.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.activos.application.dto.request.TiposDocumentoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.TiposDocumentoResponse;
import com.endecorani.sigma_api.modules.activos.application.service.TiposDocumentoService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/tipos-documento")
@RequiredArgsConstructor
@Tag(
        name = "Tipos de Documento",
        description = "Administración del catálogo de tipos de documento de activos"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class TiposDocumentoController
        extends AbstractCrudController<
        TiposDocumentoRequest,
        TiposDocumentoResponse,
        UUID
        > {

    private final TiposDocumentoService tiposDocumentoService;

    @Override
    protected CrudService<
            TiposDocumentoRequest,
            TiposDocumentoResponse,
            UUID
            > service() {
        return tiposDocumentoService;
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar tipos de documento por código o nombre")
    public ResponseEntity<ApiResponse<PageResponse<TiposDocumentoResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        tiposDocumentoService.search(q, pageRequest)
                )
        );
    }
}