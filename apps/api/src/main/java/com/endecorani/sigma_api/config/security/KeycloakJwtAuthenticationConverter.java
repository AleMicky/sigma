package com.endecorani.sigma_api.config.security;

import com.endecorani.sigma_api.config.keycloak.KeycloakProperties;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Component
public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String REALM_ACCESS = "realm_access";
    private static final String RESOURCE_ACCESS = "resource_access";
    private static final String ROLES = "roles";
    private static final String ROLE_PREFIX = "ROLE_";

    private final KeycloakProperties keycloakProperties;

    /**
     * Constructor sin propiedades reservado a tests que no negocian JWT. Sin client-id
     * configurado no se acepta ningún rol de cliente (fail-closed).
     */
    public KeycloakJwtAuthenticationConverter() {
        this(null);
    }

    @Autowired
    public KeycloakJwtAuthenticationConverter(KeycloakProperties keycloakProperties) {
        this.keycloakProperties = keycloakProperties;
    }

    @Override
    public AbstractAuthenticationToken convert(@NonNull Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractRoles(jwt);
        String principalName = resolvePrincipalName(jwt);

        return new JwtAuthenticationToken(
                jwt,
                authorities,
                principalName
        );
    }

    private Collection<GrantedAuthority> extractRoles(Jwt jwt) {
        Set<GrantedAuthority> authorities = new HashSet<>();

        // 1. Roles de Realm (realm_access.roles)
        Map<String, Object> realmAccess = jwt.getClaimAsMap(REALM_ACCESS);
        if (realmAccess != null && realmAccess.get(ROLES) instanceof Collection<?> realmRoles) {
            for (Object role : realmRoles) {
                if (role instanceof String roleName && !roleName.isBlank()) {
                    authorities.add(toAuthority(roleName));
                }
            }
        }

        // REQ-SEG-003: sólo los roles del client configurado en app.keycloak.client-id.
        // Los roles de otros clients del mismo realm NO deben convertirse en autoridades
        // de esta aplicación (evita escalada de ADMIN entre clientes).
        String clientId = keycloakProperties == null ? null : keycloakProperties.clientId();
        Map<String, Object> resourceAccess = jwt.getClaimAsMap(RESOURCE_ACCESS);
        if (resourceAccess != null && clientId != null && !clientId.isBlank()) {
            Object clientData = resourceAccess.get(clientId);
            if (clientData instanceof Map<?, ?> rolesByClient
                    && rolesByClient.get(ROLES) instanceof Collection<?> clientRoles) {
                for (Object role : clientRoles) {
                    if (role instanceof String roleName && !roleName.isBlank()) {
                        authorities.add(toAuthority(roleName));
                    }
                }
            }
        }

        return authorities;
    }

    private static SimpleGrantedAuthority toAuthority(String roleName) {
        String authority = roleName.startsWith(ROLE_PREFIX) ? roleName : ROLE_PREFIX + roleName;
        return new SimpleGrantedAuthority(authority);
    }

    private String resolvePrincipalName(Jwt jwt) {
        String preferredUsername = jwt.getClaimAsString("preferred_username");

        if (preferredUsername != null && !preferredUsername.isBlank()) {
            return preferredUsername;
        }
        return jwt.getSubject();
    }
}
