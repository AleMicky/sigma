package com.endecorani.sigma_api.modules.seguridad.domain.repository;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Rol;

import java.util.List;

public interface KeycloakRolProvider {
    List<Rol> obtenerTodos();
}