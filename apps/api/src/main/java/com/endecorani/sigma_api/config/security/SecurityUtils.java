package com.endecorani.sigma_api.config.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private static final int MAX_CACHE_SIZE = 1000;

    private final JdbcClient jdbcClient;
    private final Map<String, UUID> keycloakUserCache = new ConcurrentHashMap<>();
    private final Map<String, UUID> usernameUserCache = new ConcurrentHashMap<>();

    /**
     * Limpia la caché en memoria de resolución de usuarios.
     */
    public void clearCache() {
        keycloakUserCache.clear();
        usernameUserCache.clear();
    }

    /**
     * Verifica si el usuario autenticado tiene rol de administrador.
     */
    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return false;
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(String::toUpperCase)
                .anyMatch(a -> a.equals("ROLE_ADMIN")
                        || a.equals("ADMIN")
                        || a.equals("ROLE_ADMINISTRADOR")
                        || a.equals("ADMINISTRADOR"));
    }

    /**
     * Retorna el UUID de UsuarioEntity correspondiente al usuario autenticado actual.
     * Primero intenta resolverlo mediante keycloak_user_id (sub del JWT) o username.
     * Utiliza JdbcClient y cache en memoria para evitar invocar el EntityManager de JPA
     * dentro de listeners de ciclo de vida de entidades (lo que causa recursión infinita por auto-flush de Hibernate).
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
            UUID cachedId = keycloakUserCache.get(keycloakUserId);
            if (cachedId != null) {
                return Optional.of(cachedId);
            }
            try {
                Optional<UUID> userId = jdbcClient.sql("SELECT id FROM seguridad.usuarios WHERE keycloak_user_id = :keycloakUserId LIMIT 1")
                        .param("keycloakUserId", keycloakUserId)
                        .query(UUID.class)
                        .optional();
                if (userId.isPresent()) {
                    if (keycloakUserCache.size() >= MAX_CACHE_SIZE) {
                        keycloakUserCache.clear();
                    }
                    keycloakUserCache.put(keycloakUserId, userId.get());
                    return userId;
                }
            } catch (Exception e) {
                log.warn("Error resolviendo usuario por keycloakUserId: {}", e.getMessage());
            }
        }

        // 2. Buscar por Username
        if (username != null && !username.isBlank()) {
            UUID cachedId = usernameUserCache.get(username.toLowerCase());
            if (cachedId != null) {
                return Optional.of(cachedId);
            }
            try {
                Optional<UUID> userId = jdbcClient.sql("SELECT id FROM seguridad.usuarios WHERE lower(username) = lower(:username) LIMIT 1")
                        .param("username", username)
                        .query(UUID.class)
                        .optional();
                if (userId.isPresent()) {
                    if (usernameUserCache.size() >= MAX_CACHE_SIZE) {
                        usernameUserCache.clear();
                    }
                    usernameUserCache.put(username.toLowerCase(), userId.get());
                    return userId;
                }
            } catch (Exception e) {
                log.warn("Error resolviendo usuario por username: {}", e.getMessage());
            }
        }

        return Optional.empty();
    }

    /**
     * Retorna el nombre de usuario o nombre completo del usuario autenticado actual.
     */
    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return "Sistema";
        }
        if (auth.getPrincipal() instanceof Jwt jwt) {
            String name = jwt.getClaimAsString("name");
            if (name != null && !name.isBlank()) {
                return name;
            }
            String preferredUsername = jwt.getClaimAsString("preferred_username");
            if (preferredUsername != null && !preferredUsername.isBlank()) {
                return preferredUsername;
            }
        }
        return auth.getName() != null ? auth.getName() : "Sistema";
    }
}

