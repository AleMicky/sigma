package com.endecorani.sigma_api.modules.auth.application.service;

import com.endecorani.sigma_api.config.keycloak.KeycloakTokenClient;
import com.endecorani.sigma_api.modules.auth.application.dto.AuthTokenResponse;
import com.endecorani.sigma_api.modules.auth.application.dto.AuthUserResponse;
import com.endecorani.sigma_api.modules.auth.application.dto.KeycloakTokenResponse;
import com.endecorani.sigma_api.modules.auth.application.dto.LoginRequest;
import com.endecorani.sigma_api.modules.auth.application.dto.LogoutRequest;
import com.endecorani.sigma_api.modules.auth.application.dto.RefreshTokenRequest;
import com.endecorani.sigma_api.shared.domain.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String ROLE_PREFIX = "ROLE_";

    private final KeycloakTokenClient keycloakTokenClient;
    private final JsonMapper jsonMapper;

    public AuthTokenResponse login(LoginRequest request) {
        KeycloakTokenResponse tokens = keycloakTokenClient.passwordGrant(
                request.username(),
                request.password()
        );
        return toAuthTokenResponse(tokens);
    }

    public AuthTokenResponse refresh(RefreshTokenRequest request) {
        KeycloakTokenResponse tokens = keycloakTokenClient.refreshGrant(
                request.refreshToken()
        );
        return toAuthTokenResponse(tokens);
    }

    public void logout(LogoutRequest request) {
        keycloakTokenClient.logout(request.refreshToken());
    }

    public AuthUserResponse getCurrentUser(Authentication authentication) {
        Jwt jwt = extractJwt(authentication);

        return new AuthUserResponse(
                jwt.getSubject(),
                jwt.getClaimAsString("preferred_username"),
                jwt.getClaimAsString("name"),
                jwt.getClaimAsString("email"),
                extractRoles(authentication)
        );
    }

    private AuthTokenResponse toAuthTokenResponse(KeycloakTokenResponse tokens) {
        // Parseo local del JWT (sin JWKS remoto) para no duplicar latencia tras el token endpoint.
        AuthUserResponse user = userFromAccessToken(tokens.accessToken());

        return new AuthTokenResponse(
                tokens.accessToken(),
                tokens.refreshToken(),
                tokens.expiresIn(),
                tokens.tokenType() != null ? tokens.tokenType() : "Bearer",
                user
        );
    }

    private AuthUserResponse userFromAccessToken(String accessToken) {
        JsonNode payload = parseJwtPayload(accessToken);

        return new AuthUserResponse(
                textOrNull(payload, "sub"),
                textOrNull(payload, "preferred_username"),
                textOrNull(payload, "name"),
                textOrNull(payload, "email"),
                extractRealmRoles(payload)
        );
    }

    private JsonNode parseJwtPayload(String accessToken) {
        try {
            String[] parts = accessToken.split("\\.");
            if (parts.length < 2) {
                throw new UnauthorizedException("Access token JWT inválido");
            }
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            return jsonMapper.readTree(new String(decoded, StandardCharsets.UTF_8));
        } catch (UnauthorizedException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new UnauthorizedException("No se pudo leer el access token de Keycloak");
        }
    }

    private List<String> extractRealmRoles(JsonNode payload) {
        JsonNode rolesNode = payload.path("realm_access").path("roles");
        if (!rolesNode.isArray()) {
            return List.of();
        }

        List<String> roles = new ArrayList<>();
        for (JsonNode roleNode : rolesNode) {
            String role = roleNode.asText("").trim();
            if (!role.isBlank()) {
                roles.add(role);
            }
        }
        return roles.stream().sorted().toList();
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        String text = value.asText("").trim();
        return text.isEmpty() ? null : text;
    }

    private Jwt extractJwt(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken();
        }

        if (authentication != null
                && authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt;
        }

        throw new UnauthorizedException(
                "La autenticación actual no contiene un JWT válido"
        );
    }

    private List<String> extractRoles(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .map(this::stripRolePrefix)
                .filter(role -> !role.isBlank())
                .sorted()
                .toList();
    }

    private String stripRolePrefix(String authority) {
        if (authority.startsWith(ROLE_PREFIX)) {
            return authority.substring(ROLE_PREFIX.length());
        }
        return authority;
    }
}
