package com.endecorani.sigma_api.modules.parametros.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.parametros.application.dto.request.CatalogoItemRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.CatalogoItemResponse;
import com.endecorani.sigma_api.modules.parametros.application.service.CatalogoItemService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/catalogo-items")
@RequiredArgsConstructor
@Tag(
        name = "Ítems de catálogo",
        description = "Administración de valores de catálogos de parámetros"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class CatalogoItemController {

    private final CatalogoItemService catalogoItemService;

    @PostMapping
    public ResponseEntity<ApiResponse<CatalogoItemResponse>> create(
            @Valid @RequestBody CatalogoItemRequest request
    ) {
        CatalogoItemResponse response = catalogoItemService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Registro creado correctamente",
                                response
                        )
                );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CatalogoItemResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody CatalogoItemRequest request
    ) {
        CatalogoItemResponse response = catalogoItemService.update(id, request);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro actualizado correctamente",
                        response
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CatalogoItemResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        catalogoItemService.findById(id)
                )
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CatalogoItemResponse>>> findAll(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        catalogoItemService.findAll(pageRequest)
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id
    ) {
        catalogoItemService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Registro eliminado correctamente"
                )
        );
    }

    @GetMapping(params = "catalogoId")
    @Operation(summary = "Listar ítems filtrados por catálogo (UUID)")
    public ResponseEntity<ApiResponse<PageResponse<CatalogoItemResponse>>> findByCatalogoId(
            @RequestParam UUID catalogoId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        catalogoItemService.findByCatalogoId(
                                catalogoId,
                                q,
                                pageRequest
                        )
                )
        );
    }

    @GetMapping("/by-codigo/{codigo}")
    @Operation(summary = "Listar ítems filtrados por código de catálogo")
    public ResponseEntity<ApiResponse<PageResponse<CatalogoItemResponse>>> findByCodigo(
            @PathVariable String codigo,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        catalogoItemService.findByCodigo(
                                codigo,
                                q,
                                pageRequest
                        )
                )
        );
    }
}
