package com.endecorani.sigma_api.modules.auth.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.auth.application.dto.AuthTokenResponse;
import com.endecorani.sigma_api.modules.auth.application.dto.AuthUserResponse;
import com.endecorani.sigma_api.modules.auth.application.dto.LoginRequest;
import com.endecorani.sigma_api.modules.auth.application.dto.RefreshTokenRequest;
import com.endecorani.sigma_api.modules.auth.application.service.AuthService;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/auth")
@RequiredArgsConstructor
@Tag(
        name = "Autenticación",
        description = "Login BFF contra Keycloak e información del usuario autenticado"
)
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @SecurityRequirements
    @Operation(
            summary = "Iniciar sesión",
            description = "Intercambia usuario y contraseña con Keycloak (password grant) y devuelve tokens + usuario. No requiere Authorize de Swagger."
    )
    public ResponseEntity<ApiResponse<AuthTokenResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Sesión iniciada",
                        authService.login(request)
                )
        );
    }

    @PostMapping("/refresh")
    @SecurityRequirements
    @Operation(
            summary = "Renovar sesión",
            description = "Renueva el access token con un refresh token de Keycloak. No requiere Authorize de Swagger."
    )
    public ResponseEntity<ApiResponse<AuthTokenResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Sesión renovada",
                        authService.refresh(request)
                )
        );
    }

    @GetMapping("/me")
    @SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
    @Operation(
            summary = "Usuario actual",
            description = "Devuelve los datos del usuario autenticado a partir del JWT"
    )
    public ResponseEntity<ApiResponse<AuthUserResponse>> me(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Usuario autenticado",
                        authService.getCurrentUser(authentication)
                )
        );
    }
}
