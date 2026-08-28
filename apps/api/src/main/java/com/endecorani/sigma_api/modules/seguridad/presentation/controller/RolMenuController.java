package com.endecorani.sigma_api.modules.seguridad.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.seguridad.application.dto.request.AsignarMenusRolRequest;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.MenuResponse;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.MenuTreeNode;
import com.endecorani.sigma_api.modules.seguridad.application.service.RolMenuService;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/roles/{rolId}/menus")
@RequiredArgsConstructor
@Tag(
        name = "Roles - Menús",
        description = "Asignación y consulta de menús asociados a roles"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class RolMenuController {

    private final RolMenuService rolMenuService;

    @GetMapping
    @Operation(summary = "Listar menús asignados a un rol")
    public ResponseEntity<ApiResponse<List<MenuResponse>>> findMenusByRol(@PathVariable UUID rolId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        rolMenuService.obtenerMenusPorRol(rolId)
                )
        );
    }

    @GetMapping("/ids")
    @Operation(summary = "Listar IDs de menús asignados a un rol")
    public ResponseEntity<ApiResponse<List<UUID>>> findMenuIdsByRol(@PathVariable UUID rolId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        rolMenuService.obtenerMenuIdsPorRol(rolId)
                )
        );
    }

    @GetMapping("/arbol")
    @Operation(summary = "Obtener árbol de menús asignados a un rol")
    public ResponseEntity<ApiResponse<List<MenuTreeNode>>> findArbolMenusByRol(@PathVariable UUID rolId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        rolMenuService.obtenerArbolMenusPorRol(rolId)
                )
        );
    }

    @PutMapping
    @Operation(summary = "Asignar menús a un rol")
    public ResponseEntity<ApiResponse<List<UUID>>> asignarMenus(
            @PathVariable UUID rolId,
            @Valid @RequestBody AsignarMenusRolRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Menús asignados correctamente al rol",
                        rolMenuService.asignarMenus(rolId, request)
                )
        );
    }
}
