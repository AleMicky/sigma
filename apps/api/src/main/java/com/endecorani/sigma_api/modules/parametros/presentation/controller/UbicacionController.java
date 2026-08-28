package com.endecorani.sigma_api.modules.parametros.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.parametros.application.dto.request.UbicacionRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.UbicacionResponse;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.UbicacionTreeNode;
import com.endecorani.sigma_api.modules.parametros.application.service.UbicacionService;
import com.endecorani.sigma_api.modules.parametros.domain.enums.TipoUbicacion;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/ubicaciones")
@RequiredArgsConstructor
@Tag(
        name = "Ubicaciones",
        description = "Administración de ubicaciones con jerarquía recursiva"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class UbicacionController
        extends AbstractCrudController<
        UbicacionRequest,
        UbicacionResponse,
        UUID
        > {

    private final UbicacionService ubicacionService;

    @Override
    protected CrudService<
            UbicacionRequest,
            UbicacionResponse,
            UUID
            > service() {
        return ubicacionService;
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar ubicaciones por código o nombre")
    public ResponseEntity<ApiResponse<PageResponse<UbicacionResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        ubicacionService.search(q, pageRequest)
                )
        );
    }

    @GetMapping(params = "tipo")
    @Operation(summary = "Filtrar ubicaciones por tipo")
    public ResponseEntity<ApiResponse<PageResponse<UbicacionResponse>>> findByTipo(
            @RequestParam TipoUbicacion tipo,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        ubicacionService.findByTipo(tipo, pageRequest)
                )
        );
    }

    @GetMapping("/raices")
    @Operation(summary = "Obtener ubicaciones raíz (sin padre)")
    public ResponseEntity<ApiResponse<List<UbicacionResponse>>> findRaices() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        ubicacionService.findRaices()
                )
        );
    }

    @GetMapping("/arbol")
    @Operation(summary = "Obtener árbol jerárquico completo de ubicaciones")
    public ResponseEntity<ApiResponse<List<UbicacionTreeNode>>> buildArbol() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        ubicacionService.buildArbol()
                )
        );
    }

    @GetMapping("/{id}/hijos")
    @Operation(summary = "Obtener ubicaciones hijas directas de una ubicación")
    public ResponseEntity<ApiResponse<List<UbicacionResponse>>> findHijos(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        ubicacionService.findHijos(id)
                )
        );
    }

    @GetMapping("/{id}/arbol")
    @Operation(summary = "Obtener subárbol jerárquico desde una ubicación específica")
    public ResponseEntity<ApiResponse<UbicacionTreeNode>> buildArbol(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        ubicacionService.buildArbol(id)
                )
        );
    }
}