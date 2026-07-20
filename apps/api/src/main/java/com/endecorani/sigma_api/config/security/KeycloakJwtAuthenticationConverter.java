package com.endecorani.sigma_api.config.security;



import org.jspecify.annotations.NonNull;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

// Spring Security no convierte automáticamente ese campo en authorities, así que crearemos un convertidor.
@Component
public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String REALM_ACCESS = "realm_access";
    private static final String ROLES = "roles";
    private static final String ROLE_PREFIX = "ROLE_";

    @Override
    public AbstractAuthenticationToken convert(@NonNull Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractRealmRoles(jwt);
        String principalName = resolvePrincipalName(jwt);

        return new JwtAuthenticationToken(
                jwt,
                authorities,
                principalName
        );
    }

    private Collection<GrantedAuthority> extractRealmRoles(Jwt jwt) {

        Map<String, Object> realmAccess = jwt.getClaimAsMap(REALM_ACCESS);

        if (realmAccess == null) {
            return List.of();
        }

        Object rolesClaim = realmAccess.get(ROLES);

        if (!(rolesClaim instanceof Collection<?> roles)) {
            return List.of();
        }

        List<GrantedAuthority> authorities = new ArrayList<>();

        for (Object role : roles) {
            if (role instanceof String roleName && !roleName.isBlank()) {
                authorities.add(
                        new SimpleGrantedAuthority(ROLE_PREFIX + roleName)
                );
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
