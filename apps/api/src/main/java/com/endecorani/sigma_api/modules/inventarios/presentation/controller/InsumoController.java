package com.endecorani.sigma_api.modules.inventarios.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.inventarios.application.dto.request.InsumoRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.InsumoResponse;
import com.endecorani.sigma_api.modules.inventarios.application.service.InsumoService;
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
@RequestMapping(ApiConstants.API_V1 + "/insumos")
@RequiredArgsConstructor
@Tag(
        name = "Insumos",
        description = "Administración del catálogo de insumos"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class InsumoController {

    private final InsumoService insumoService;

    @GetMapping
    @Operation(summary = "Listar insumos paginados")
    public ResponseEntity<ApiResponse<PageResponse<InsumoResponse>>> findAll(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(insumoService.findAll(pageRequest))
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un insumo por ID")
    public ResponseEntity<ApiResponse<InsumoResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.success(insumoService.findById(id))
        );
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar insumos por código, nombre o descripción")
    public ResponseEntity<ApiResponse<PageResponse<InsumoResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(insumoService.search(q, pageRequest))
        );
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo insumo")
    public ResponseEntity<ApiResponse<InsumoResponse>> create(
            @Valid @RequestBody InsumoRequest request
    ) {
        InsumoResponse response = insumoService.create(request);
        return ResponseEntity
                .created(URI.create(ApiConstants.API_V1 + "/insumos/" + response.id()))
                .body(ApiResponse.success("Insumo creado correctamente", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un insumo existente")
    public ResponseEntity<ApiResponse<InsumoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody InsumoRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Insumo actualizado correctamente", insumoService.update(id, request))
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un insumo por ID")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        insumoService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Insumo eliminado correctamente", null)
        );
    }
}
