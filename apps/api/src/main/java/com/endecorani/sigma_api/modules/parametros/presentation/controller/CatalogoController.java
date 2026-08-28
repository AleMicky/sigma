package com.endecorani.sigma_api.modules.parametros.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.parametros.application.dto.request.CatalogoRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.CatalogoResponse;
import com.endecorani.sigma_api.modules.parametros.application.service.CatalogoService;
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
@RequestMapping(ApiConstants.API_V1 + "/catalogos")
@RequiredArgsConstructor
@Tag(
        name = "Catálogos",
        description = "Administración de catálogos de parámetros"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class CatalogoController
        extends AbstractCrudController<
        CatalogoRequest,
        CatalogoResponse,
        UUID
        > {

    private final CatalogoService catalogoService;

    @Override
    protected CrudService<
            CatalogoRequest,
            CatalogoResponse,
            UUID
            > service() {
        return catalogoService;
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar catálogos por código o nombre")
    public ResponseEntity<ApiResponse<PageResponse<CatalogoResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        catalogoService.search(q, pageRequest)
                )
        );
    }
}
