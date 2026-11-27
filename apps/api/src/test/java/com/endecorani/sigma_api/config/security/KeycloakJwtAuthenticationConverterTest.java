package com.endecorani.sigma_api.config.security;

import com.endecorani.sigma_api.config.keycloak.KeycloakProperties;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** REQ-SEG-003: los roles de cliente se toman sólo del client configurado en la app. */
class KeycloakJwtAuthenticationConverterTest {

    private static final KeycloakProperties PROPERTIES = new KeycloakProperties(
            "http://keycloak.test", "sigma", null, null, "sigma-web", null, "sigma-web");

    private final KeycloakJwtAuthenticationConverter converter =
            new KeycloakJwtAuthenticationConverter(PROPERTIES);

    @Test
    void adminEnOtroClientDelRealm_noDebeConvertirseEnRoleAdmin() {
        Jwt jwt = jwtCon(Map.of("account", Map.of("roles", List.of("ADMIN"))), List.of("USER"));

        Set<String> authorities = authorities(jwt);

        assertFalse(authorities.contains("ROLE_ADMIN"),
                "Un ADMIN de otro client del realm no debe escalar en esta aplicación");
        assertTrue(authorities.contains("ROLE_USER"), "Los roles del realm siguen vigentes");
    }

    @Test
    void adminEnClientConfigurado_debeConvertirseEnRoleAdmin() {
        Jwt jwt = jwtCon(Map.of("sigma-web", Map.of("roles", List.of("ADMIN"))), List.of());

        Set<String> authorities = authorities(jwt);

        assertTrue(authorities.contains("ROLE_ADMIN"));
    }

    @Test
    void rolesDeAmbosClients_noDebenMezclarseYPrefijoNoSeDuplica() {
        Jwt jwt = jwtCon(
                Map.of(
                        "sigma-web", Map.of("roles", List.of("ROLE_AUDITOR")),
                        "otro-client", Map.of("roles", List.of("ROOT", "ADMIN"))
                ),
                List.of()
        );

        Set<String> authorities = authorities(jwt);

        assertTrue(authorities.contains("ROLE_AUDITOR"));
        assertFalse(authorities.contains("ROLE_AUDITOR_AUDITOR"));
        assertFalse(authorities.contains("ROLE_ROOT"));
        assertFalse(authorities.contains("ROLE_ADMIN"));
    }

    @Test
    void sinClientIdConfigurado_noDebeAceptarRolesDeCliente() {
        KeycloakJwtAuthenticationConverter sinConfigurar = new KeycloakJwtAuthenticationConverter(
                new KeycloakProperties("http://keycloak.test", "sigma", null, null, null, null, null));
        Jwt jwt = jwtCon(Map.of("sigma-web", Map.of("roles", List.of("ADMIN"))), List.of());

        Set<String> authorities = sinConfigurar.convert(jwt).getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        assertFalse(authorities.contains("ROLE_ADMIN"));
    }

    private Set<String> authorities(Jwt jwt) {
        JwtAuthenticationToken token = (JwtAuthenticationToken) converter.convert(jwt);
        return token.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
    }

    private static Jwt jwtCon(Map<String, Object> resourceAccess, List<String> realmRoles) {
        return Jwt.withTokenValue("token")
                .header("alg", "none")
                .subject("user-id")
                .claim("preferred_username", "usuario.sigma")
                .claim("realm_access", Map.of("roles", realmRoles))
                .claim("resource_access", resourceAccess)
                .build();
    }
}
