package com.endecorani.sigma_api.modules.seguridad.presentation.controller;

import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client.KeycloakUsuarioClient;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/keycloak")
@RequiredArgsConstructor
public class KeycloakTestController {
    private final KeycloakUsuarioClient keycloakUsuarioClient;
    private final com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client.KeycloakRolClient keycloakRolClient;

    @GetMapping("/test-usuarios")
    public ResponseEntity<?> testUsuarios() {
        var usuarios = keycloakUsuarioClient.obtenerTodos();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/test-roles")
    public ResponseEntity<?> testRoles() {
        var roles = keycloakRolClient.obtenerTodos();
        return ResponseEntity.ok(roles);
    }
}
