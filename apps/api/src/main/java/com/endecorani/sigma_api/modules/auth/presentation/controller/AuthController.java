package com.endecorani.sigma_api.modules.auth.presentation.controller;

import com.endecorani.sigma_api.config.openapi.OpenApiConfig;
import com.endecorani.sigma_api.modules.auth.application.dto.AuthUserResponse;
import com.endecorani.sigma_api.modules.auth.application.service.AuthService;
import com.endecorani.sigma_api.shared.application.response.ApiResponse;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(ApiConstants.API_V1 + "/auth")
@RequiredArgsConstructor
@Tag(
        name = "Autenticación",
        description = "Información del usuario autenticado vía Keycloak"
)
@SecurityRequirement(name = OpenApiConfig.SECURITY_SCHEME_NAME)
public class AuthController {

    private final AuthService authService;

    @GetMapping("/me")
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
