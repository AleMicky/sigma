package com.endecorani.sigma_api.config.security;

import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.UsuarioEntity;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository.UsuarioJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UsuarioJpaRepository usuarioJpaRepository;

    /**
     * Retorna el UUID de UsuarioEntity correspondiente al usuario autenticado actual.
     * Primero intenta resolverlo mediante keycloak_user_id (sub del JWT) o username.
     */
    public Optional<UUID> getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        String keycloakUserId = null;
        String username = auth.getName();

        if (auth.getPrincipal() instanceof Jwt jwt) {
            keycloakUserId = jwt.getSubject();
            String preferredUsername = jwt.getClaimAsString("preferred_username");
            if (preferredUsername != null && !preferredUsername.isBlank()) {
                username = preferredUsername;
            }
        }

        // 1. Buscar por Keycloak User ID (sub)
        if (keycloakUserId != null && !keycloakUserId.isBlank()) {
            Optional<UsuarioEntity> byKeycloak = usuarioJpaRepository.findByKeycloakUserId(keycloakUserId);
            if (byKeycloak.isPresent()) {
                return byKeycloak.map(UsuarioEntity::getId);
            }
        }

        // 2. Buscar por Username
        if (username != null && !username.isBlank()) {
            Optional<UsuarioEntity> byUsername = usuarioJpaRepository.findByUsernameIgnoreCase(username);
            if (byUsername.isPresent()) {
                return byUsername.map(UsuarioEntity::getId);
            }
        }

        return Optional.empty();
    }
}
