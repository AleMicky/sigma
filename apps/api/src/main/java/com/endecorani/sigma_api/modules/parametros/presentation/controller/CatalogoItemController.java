package com.endecorani.sigma_api.modules.parametros.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.parametros.application.dto.CatalogoItemRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.CatalogoItemResponse;
import com.endecorani.sigma_api.modules.parametros.application.service.CatalogoItemService;
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
@RequestMapping(ApiConstants.API_V1 + "/catalogo-items")
@RequiredArgsConstructor
@Tag(
        name = "Ítems de catálogo",
        description = "Administración de valores de catálogos de parámetros"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class CatalogoItemController
        extends AbstractCrudController<
        CatalogoItemRequest,
        CatalogoItemResponse,
        UUID
        > {

    private final CatalogoItemService catalogoItemService;

    @Override
    protected CrudService<
            CatalogoItemRequest,
            CatalogoItemResponse,
            UUID
            > service() {
        return catalogoItemService;
    }

    @GetMapping(params = "catalogoId")
    @Operation(summary = "Listar ítems filtrados por catálogo")
    public ResponseEntity<ApiResponse<PageResponse<CatalogoItemResponse>>> findByCatalogoId(
            @RequestParam UUID catalogoId,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        catalogoItemService.findByCatalogoId(
                                catalogoId,
                                pageRequest
                        )
                )
        );
    }
}
