package com.endecorani.sigma_api.modules.seguridad.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.seguridad.application.dto.request.MenuRequest;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.MenuResponse;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.MenuTreeNode;
import com.endecorani.sigma_api.modules.seguridad.application.service.MenuService;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/menus")
@RequiredArgsConstructor
@Tag(
        name = "Menús",
        description = "Administración de menús con jerarquía recursiva"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class MenuController {

    private final MenuService menuService;

    @PostMapping
    @Operation(summary = "Crear un menú")
    public ResponseEntity<ApiResponse<MenuResponse>> create(
            @Valid @RequestBody MenuRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Menú creado correctamente",
                                menuService.create(request)
                        )
                );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un menú")
    public ResponseEntity<ApiResponse<MenuResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody MenuRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Menú actualizado correctamente",
                        menuService.update(id, request)
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un menú")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        menuService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Menú eliminado correctamente"
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener menú por ID")
    public ResponseEntity<ApiResponse<MenuResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        menuService.findById(id)
                )
        );
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar menús por código o nombre")
    public ResponseEntity<ApiResponse<PageResponse<MenuResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        menuService.search(q, pageRequest)
                )
        );
    }

    @GetMapping("/todos")
    @Operation(summary = "Listar todos los menús sin paginación")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> findAllList() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        menuService.findAllList()
                )
        );
    }

    @GetMapping("/raices")
    @Operation(summary = "Obtener menús raíz (sin padre)")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> findRaices() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        menuService.findRaices()
                )
        );
    }

    @GetMapping("/arbol")
    @Operation(summary = "Obtener árbol jerárquico completo de menús")
    public ResponseEntity<ApiResponse<List<MenuTreeNode>>> buildArbol() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        menuService.buildArbol()
                )
        );
    }

    @GetMapping("/{id}/hijos")
    @Operation(summary = "Obtener menús hijos directos de un menú")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> findHijos(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        menuService.findHijos(id)
                )
        );
    }

    @GetMapping("/{id}/arbol")
    @Operation(summary = "Obtener subárbol jerárquico desde un menú específico")
    public ResponseEntity<ApiResponse<MenuTreeNode>> buildArbol(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        menuService.buildArbol(id)
                )
        );
    }

    @GetMapping
    @Operation(summary = "Listar menús paginados")
    public ResponseEntity<ApiResponse<PageResponse<MenuResponse>>> findAll(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        menuService.findAll(pageRequest)
                )
        );
    }
}
