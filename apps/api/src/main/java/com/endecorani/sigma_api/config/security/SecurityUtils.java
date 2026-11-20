package com.endecorani.sigma_api.config.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class SecurityUtils {

    private static final int MAX_CACHE_SIZE = 1000;
    private static final Duration DEFAULT_CACHE_TTL = Duration.ofMinutes(5);

    private record CacheEntry(UUID userId, Instant expiresAt) {
        boolean isExpired(Instant now) {
            return !now.isBefore(expiresAt);
        }
    }

    private final JdbcClient jdbcClient;
    private final Clock clock;
    private final Duration cacheTtl;
    private final Map<String, CacheEntry> keycloakUserCache = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry> usernameUserCache = new ConcurrentHashMap<>();

    @Autowired
    public SecurityUtils(JdbcClient jdbcClient) {
        this(jdbcClient, Clock.systemUTC(), DEFAULT_CACHE_TTL);
    }

    SecurityUtils(JdbcClient jdbcClient, Clock clock, Duration cacheTtl) {
        this.jdbcClient = jdbcClient;
        this.clock = clock;
        this.cacheTtl = cacheTtl;
    }

    /**
     * Limpia la caché en memoria de resolución de usuarios.
     */
    public void clearCache() {
        keycloakUserCache.clear();
        usernameUserCache.clear();
    }

    /**
     * Invalida una entrada específica en caché (útil al modificar o desactivar un usuario).
     */
    public void invalidateUser(String keycloakUserId, String username) {
        if (keycloakUserId != null && !keycloakUserId.isBlank()) {
            keycloakUserCache.remove(keycloakUserId);
        }
        if (username != null && !username.isBlank()) {
            usernameUserCache.remove(username.toLowerCase());
        }
    }

    /**
     * Verifica si el usuario autenticado tiene rol de administrador.
     */
    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return false;
        }
        String name = auth.getName();
        if (name != null && name.trim().equalsIgnoreCase("admin")) {
            return true;
        }
        if (auth.getPrincipal() instanceof Jwt jwt) {
            String pref = jwt.getClaimAsString("preferred_username");
            if (pref != null && pref.trim().equalsIgnoreCase("admin")) {
                return true;
            }
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(String::toUpperCase)
                .map(a -> a.replaceFirst("^(ROLE_|ROL_)", "").trim())
                .anyMatch(a -> a.equals("ADMIN")
                        || a.equals("SUPERADMIN")
                        || a.equals("SUPER_ADMIN")
                        || a.equals("ADMINISTRADOR"));
    }

    /**
     * Retorna el UUID de UsuarioEntity correspondiente al usuario autenticado actual.
     * Primero intenta resolverlo mediante keycloak_user_id (sub del JWT) o username.
     * Utiliza JdbcClient y caché en memoria con TTL para evitar invocar el EntityManager de JPA
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
            UUID cachedId = getCached(keycloakUserCache, keycloakUserId);
            if (cachedId != null) {
                return Optional.of(cachedId);
            }
            try {
                Optional<UUID> userId = jdbcClient.sql("SELECT id FROM seguridad.usuarios WHERE keycloak_user_id = :keycloakUserId LIMIT 1")
                        .param("keycloakUserId", keycloakUserId)
                        .query(UUID.class)
                        .optional();
                if (userId.isPresent()) {
                    putCached(keycloakUserCache, keycloakUserId, userId.get());
                    return userId;
                }
            } catch (Exception e) {
                log.warn("Error resolviendo usuario por keycloakUserId: {}", e.getMessage());
            }
        }

        // 2. Buscar por Username
        if (username != null && !username.isBlank()) {
            String normalizedUsername = username.toLowerCase();
            UUID cachedId = getCached(usernameUserCache, normalizedUsername);
            if (cachedId != null) {
                return Optional.of(cachedId);
            }
            try {
                Optional<UUID> userId = jdbcClient.sql("SELECT id FROM seguridad.usuarios WHERE lower(username) = lower(:username) LIMIT 1")
                        .param("username", username)
                        .query(UUID.class)
                        .optional();
                if (userId.isPresent()) {
                    putCached(usernameUserCache, normalizedUsername, userId.get());
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

    private UUID getCached(Map<String, CacheEntry> cache, String key) {
        CacheEntry entry = cache.get(key);
        if (entry == null) {
            return null;
        }
        Instant now = clock.instant();
        if (entry.isExpired(now)) {
            cache.remove(key, entry);
            return null;
        }
        return entry.userId();
    }

    private void putCached(Map<String, CacheEntry> cache, String key, UUID userId) {
        Instant now = clock.instant();
        if (cache.size() >= MAX_CACHE_SIZE) {
            cache.entrySet().removeIf(e -> e.getValue().isExpired(now));
            if (cache.size() >= MAX_CACHE_SIZE) {
                cache.clear();
            }
        }
        cache.put(key, new CacheEntry(userId, now.plus(cacheTtl)));
    }
}
