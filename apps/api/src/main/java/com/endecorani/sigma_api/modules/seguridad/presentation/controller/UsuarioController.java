package com.endecorani.sigma_api.modules.seguridad.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.seguridad.application.dto.response.UsuarioResponse;
import com.endecorani.sigma_api.modules.seguridad.application.service.UsuarioService;
import com.endecorani.sigma_api.modules.seguridad.application.service.UsuarioSyncService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/usuarios")
@RequiredArgsConstructor
@Tag(
        name = "Usuarios",
        description = "Administración y sincronización de usuarios del sistema"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final UsuarioSyncService usuarioSyncService;

    @GetMapping
    @Operation(summary = "Listar usuarios paginados")
    public ResponseEntity<ApiResponse<PageResponse<UsuarioResponse>>> findAll(
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        usuarioService.findAll(pageRequest)
                )
        );
    }

    @GetMapping(params = "q")
    @Operation(summary = "Buscar usuarios por nombre de usuario, nombre o correo")
    public ResponseEntity<ApiResponse<PageResponse<UsuarioResponse>>> search(
            @RequestParam String q,
            @Valid @ModelAttribute PageRequestDto pageRequest
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        usuarioService.search(q, pageRequest)
                )
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    public ResponseEntity<ApiResponse<UsuarioResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        usuarioService.findById(id)
                )
        );
    }

    @PostMapping("/sincronizar")
    @Operation(summary = "Sincronizar usuarios desde Keycloak")
    public ResponseEntity<ApiResponse<Integer>> sincronizar() {
        int totalSincronizados = usuarioSyncService.sincronizarTodos();
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Usuarios sincronizados correctamente",
                        totalSincronizados
                )
        );
    }
}
