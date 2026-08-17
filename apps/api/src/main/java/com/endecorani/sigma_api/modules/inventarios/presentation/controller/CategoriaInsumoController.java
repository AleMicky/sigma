package com.endecorani.sigma_api.modules.inventarios.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.inventarios.application.dto.request.CategoriaInsumoRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.CategoriaInsumoResponse;
import com.endecorani.sigma_api.modules.inventarios.application.service.CategoriaInsumoService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
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
public class CategoriaInsumoController {

    private final CategoriaInsumoService categoriaInsumoService;

    @GetMapping
    @Operation(summary = "Listar o buscar categorías de insumo opcionalmente por tipo de insumo y/o texto")
    public ResponseEntity<ApiResponse<PageResponse<CategoriaInsumoResponse>>> find(
            @RequestParam(required = false) UUID tipoInsumoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(categoriaInsumoService.find(tipoInsumoId, q, pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una categoría de insumo por ID")
    public ResponseEntity<ApiResponse<CategoriaInsumoResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.success(categoriaInsumoService.findById(id))
        );
    }

    @PostMapping
    @Operation(summary = "Crear una nueva categoría de insumo")
    public ResponseEntity<ApiResponse<CategoriaInsumoResponse>> create(
            @Valid @RequestBody CategoriaInsumoRequest request
    ) {
        CategoriaInsumoResponse response = categoriaInsumoService.create(request);
        return ResponseEntity
                .created(URI.create(ApiConstants.API_V1 + "/categorias-insumo/" + response.id()))
                .body(ApiResponse.success("Categoría de insumo creada correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una categoría de insumo existente")
    public ResponseEntity<ApiResponse<CategoriaInsumoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody CategoriaInsumoRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Categoría de insumo actualizada correctamente", categoriaInsumoService.update(id, request))
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una categoría de insumo por ID")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        categoriaInsumoService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Categoría de insumo eliminada correctamente", null)
        );
    }
}
