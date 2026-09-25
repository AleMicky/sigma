package com.endecorani.sigma_api.modules.seguridad.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client.KeycloakRolClient;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client.KeycloakUsuarioClient;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.dto.KeycloakRolResponse;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.dto.KeycloakUsuarioResponse;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/admin/keycloak")
@RequiredArgsConstructor
@Tag(
        name = "Keycloak Admin Test",
        description = "Herramientas administrativas para inspeccionar usuarios y roles en Keycloak"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
@PreAuthorize("hasRole('ADMIN')")
public class KeycloakTestController {

    private final KeycloakUsuarioClient keycloakUsuarioClient;
    private final KeycloakRolClient keycloakRolClient;

    @GetMapping("/test-usuarios")
    @Operation(summary = "Listar todos los usuarios en Keycloak (Solo Administradores)")
    public ResponseEntity<ApiResponse<List<KeycloakUsuarioResponse>>> testUsuarios() {
        var usuarios = keycloakUsuarioClient.obtenerTodos();
        return ResponseEntity.ok(ApiResponse.success(usuarios));
    }

    @GetMapping("/test-roles")
    @Operation(summary = "Listar todos los roles en Keycloak (Solo Administradores)")
    public ResponseEntity<ApiResponse<List<KeycloakRolResponse>>> testRoles() {
        var roles = keycloakRolClient.obtenerTodos();
        return ResponseEntity.ok(ApiResponse.success(roles));
    }
}
