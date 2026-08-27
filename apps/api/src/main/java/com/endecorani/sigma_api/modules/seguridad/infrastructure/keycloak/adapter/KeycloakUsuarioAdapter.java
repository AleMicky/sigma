package com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.adapter;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;
import com.endecorani.sigma_api.modules.seguridad.domain.repository.KeycloakUsuarioProvider;
import com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client.KeycloakUsuarioClient;
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
                .map(usuario -> new Usuario(null,
                        usuario.id(),
                        usuario.username(),
                        construirNombre(usuario.firstName(), usuario.lastName()),
                        usuario.email(),
                        usuario.enabled()
                ))
                .toList();

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
