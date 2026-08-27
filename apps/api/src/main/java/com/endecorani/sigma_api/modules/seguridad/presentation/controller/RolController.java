package com.endecorani.sigma_api.modules.seguridad.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.RolResponse;
import com.endecorani.sigma_api.modules.seguridad.application.service.RolService;
import com.endecorani.sigma_api.modules.seguridad.application.service.RolSyncService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/roles")
@RequiredArgsConstructor
@Tag(
        name = "Roles",
        description = "Administración y sincronización de roles del sistema"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasAnyRole('ADMIN')")
public class RolController {

    private final RolService rolService;
    private final RolSyncService rolSyncService;

    @GetMapping
    @Operation(summary = "Listar roles paginados")
    public ResponseEntity<ApiResponse<PageResponse<RolResponse>>> findAll(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        rolService.findAll(pageRequest)
                )
        );
    }

    @GetMapping("/todos")
    @Operation(summary = "Listar todos los roles sin paginación")
    public ResponseEntity<ApiResponse<List<RolResponse>>> findAllList() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        rolService.findAllList()
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener rol por ID")
    public ResponseEntity<ApiResponse<RolResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        rolService.findById(id)
                )
        );
    }

    @PostMapping("/sincronizar")
    @Operation(summary = "Sincronizar roles desde Keycloak")
    public ResponseEntity<ApiResponse<Integer>> sincronizar() {
        int totalSincronizados = rolSyncService.sincronizarTodos();
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Roles sincronizados correctamente",
                        totalSincronizados
                )
        );
    }
}
