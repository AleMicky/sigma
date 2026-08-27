package com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.adapter;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Rol;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.KeycloakUsuarioProvider;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client.KeycloakUsuarioClient;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.dto.KeycloakRolResponse;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.dto.KeycloakUsuarioResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component
@RequiredArgsConstructor
public class KeycloakUsuarioAdapter implements KeycloakUsuarioProvider {

    private final KeycloakUsuarioClient client;

    @Override
    public List<Usuario> obtenerTodos() {
        return client.obtenerTodos()
                .stream()
                .map(this::toUsuarioDomain)
                .toList();
    }

    @Override
    public List<Rol> obtenerRolesDeUsuario(String keycloakUserId) {
        return client.obtenerRolesDeUsuario(keycloakUserId)
                .stream()
                .map(this::toRolDomain)
                .toList();
    }

    private Usuario toUsuarioDomain(KeycloakUsuarioResponse usuario) {
        return Usuario.builder()
                .keycloakUserId(usuario.id())
                .username(usuario.username())
                .nombre(construirNombre(usuario.firstName(), usuario.lastName()))
                .email(usuario.email())
                .activo(usuario.enabled())
                .build();
    }

    private Rol toRolDomain(KeycloakRolResponse rol) {
        return Rol.builder()
                .keycloakRoleId(rol.id())
                .codigo(rol.name())
                .nombre(rol.name())
                .descripcion(rol.description())
                .activo(true)
                .build();
    }

    private String construirNombre(
            String firstName,
            String lastName
    ) {
        return Stream.of(firstName, lastName)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(valor -> !valor.isBlank())
                .collect(Collectors.joining(" "));
    }
}
