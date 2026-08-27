package com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.adapter;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Rol;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.KeycloakRolProvider;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client.KeycloakRolClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class KeycloakRolAdapter implements KeycloakRolProvider {

    private final KeycloakRolClient client;

    @Override
    public List<Rol> obtenerTodos() {
        return client.obtenerTodos()
                .stream()
                .map(this::toDomain)
                .toList();
    }

    private Rol toDomain(com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.dto.KeycloakRolResponse rol) {
        return Rol.builder()
                .keycloakRoleId(rol.id())
                .codigo(rol.name())
                .nombre(rol.name())
                .descripcion(rol.description())
                .activo(true)
                .build();
    }
}
