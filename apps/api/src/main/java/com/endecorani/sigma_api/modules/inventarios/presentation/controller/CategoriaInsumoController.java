package com.endecorani.sigma_api.modules.inventarios.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.inventarios.application.dto.request.CategoriaInsumoRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.CategoriaInsumoResponse;
import com.endecorani.sigma_api.modules.inventarios.application.service.CategoriaInsumoService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/categorias-insumo")
@RequiredArgsConstructor
@Tag(
        name = "Categorías de insumo",
        description = "Administración del catálogo de categorías de insumo"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class CategoriaInsumoController
        extends AbstractCrudController<
        CategoriaInsumoRequest,
        CategoriaInsumoResponse,
        UUID
        > {

    private final CategoriaInsumoService categoriaInsumoService;

    @Override
    protected CrudService<
            CategoriaInsumoRequest,
            CategoriaInsumoResponse,
            UUID
            > service() {
        return categoriaInsumoService;
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar categorías de insumo por código, nombre o descripción")
    public ResponseEntity<ApiResponse<PageResponse<CategoriaInsumoResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        categoriaInsumoService.search(q, pageRequest)
                )
        );
    }

    @GetMapping("/tipo-insumo/{tipoInsumoId}")
    @Operation(summary = "Obtener o buscar categorías de insumo por tipo de insumo")
    public ResponseEntity<ApiResponse<PageResponse<CategoriaInsumoResponse>>> findByTipoInsumoId(
            @PathVariable UUID tipoInsumoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        categoriaInsumoService.findByTipoInsumoId(tipoInsumoId, q, pageRequest)
                )
        );
    }
}
