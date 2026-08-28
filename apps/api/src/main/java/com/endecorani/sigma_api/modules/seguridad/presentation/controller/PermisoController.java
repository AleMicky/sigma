package com.endecorani.sigma_api.modules.seguridad.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.seguridad.application.dto.request.PermisoRequest;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.PermisoResponse;
import com.endecorani.sigma_api.modules.seguridad.application.service.PermisoService;
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
@RequestMapping(ApiConstants.API_V1 + "/permisos")
@RequiredArgsConstructor
@Tag(
        name = "Permisos",
        description = "Administración de permisos por menú"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("isAuthenticated()")
public class PermisoController {

    private final PermisoService permisoService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Crear un permiso")
    public ResponseEntity<ApiResponse<PermisoResponse>> create(
            @Valid @RequestBody PermisoRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Permiso creado correctamente",
                                permisoService.create(request)
                        )
                );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Actualizar un permiso")
    public ResponseEntity<ApiResponse<PermisoResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody PermisoRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Permiso actualizado correctamente",
                        permisoService.update(id, request)
                )
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Eliminar un permiso")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        permisoService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Permiso eliminado correctamente")
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Obtener permiso por ID")
    public ResponseEntity<ApiResponse<PermisoResponse>> findById(
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(permisoService.findById(id))
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(
            summary = "Listar permisos paginados",
            description = "Lista permisos con opción de filtrar por menuId"
    )
    public ResponseEntity<ApiResponse<PageResponse<PermisoResponse>>> findAll(
            @RequestParam(required = false) UUID menuId,
            @RequestParam(required = false) String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        if (menuId != null) {
            if (q != null && !q.isBlank()) {
                return ResponseEntity.ok(
                        ApiResponse.success(
                                permisoService.searchByMenuId(menuId, q, pageRequest)
                        )
                );
            }
            return ResponseEntity.ok(
                    ApiResponse.success(
                            permisoService.findByMenuId(menuId, pageRequest)
                    )
            );
        }

        if (q != null && !q.isBlank()) {
            return ResponseEntity.ok(
                    ApiResponse.success(
                            permisoService.search(q, pageRequest)
                    )
            );
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        permisoService.findAll(pageRequest)
                )
        );
    }

    @GetMapping("/todos")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Listar todos los permisos sin paginación")
    public ResponseEntity<ApiResponse<List<PermisoResponse>>> findAllList() {
        return ResponseEntity.ok(
                ApiResponse.success(permisoService.findAllList())
        );
    }

    @GetMapping("/todos/menu/{menuId}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Listar permisos de un menú sin paginación")
    public ResponseEntity<ApiResponse<List<PermisoResponse>>> findByMenuIdList(
            @PathVariable UUID menuId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(permisoService.findByMenuIdList(menuId))
        );
    }
}
