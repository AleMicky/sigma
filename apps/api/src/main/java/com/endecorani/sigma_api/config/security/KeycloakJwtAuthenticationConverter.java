package com.endecorani.sigma_api.config.security;

import org.jspecify.annotations.NonNull;
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
                    authorities.add(new SimpleGrantedAuthority(ROLE_PREFIX + roleName));
                }
            }
        }

        // 2. Roles de Clientes (resource_access.<client>.roles)
        Map<String, Object> resourceAccess = jwt.getClaimAsMap(RESOURCE_ACCESS);
        if (resourceAccess != null) {
            for (Map.Entry<String, Object> entry : resourceAccess.entrySet()) {
                if (entry.getValue() instanceof Map<?, ?> clientData
                        && clientData.get(ROLES) instanceof Collection<?> clientRoles) {
                    for (Object role : clientRoles) {
                        if (role instanceof String roleName && !roleName.isBlank()) {
                            authorities.add(new SimpleGrantedAuthority(ROLE_PREFIX + roleName));
                        }
                    }
                }
            }
        }

        return authorities;
    }

    private String resolvePrincipalName(Jwt jwt) {
        String preferredUsername = jwt.getClaimAsString("preferred_username");

        if (preferredUsername != null && !preferredUsername.isBlank()) {
            return preferredUsername;
        }
        return jwt.getSubject();
    }
}
