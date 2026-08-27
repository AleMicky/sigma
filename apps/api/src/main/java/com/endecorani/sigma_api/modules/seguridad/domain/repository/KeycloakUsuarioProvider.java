package com.endecorani.sigma_api.modules.seguridad.domain.repository;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Rol;
import com.endecorani.sigma_api.modules.seguridad.domain.model.Usuario;

import java.util.List;

public interface KeycloakUsuarioProvider {

    List<Usuario> obtenerTodos();

    List<Rol> obtenerRolesDeUsuario(String keycloakUserId);
}