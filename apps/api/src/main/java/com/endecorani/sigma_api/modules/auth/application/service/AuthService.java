package com.endecorani.sigma_api.modules.auth.application.service;

import com.endecorani.sigma_api.modules.auth.application.dto.AuthUserResponse;
import com.endecorani.sigma_api.shared.domain.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private static final String ROLE_PREFIX = "ROLE_";

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
