package com.endecorani.sigma_api.modules.seguridad.domain.repository;

import com.endecorani.sigma_api.modules.seguridad.domain.model.Rol;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RolRepository {

    Optional<Rol> findById(UUID id);

    Optional<Rol> findByKeycloakRoleId(String keycloakRoleId);

    Optional<Rol> findByCodigo(String codigo);

    Rol save(Rol rol);

    List<Rol> findAll();

    Page<Rol> findAll(Pageable pageable);
}