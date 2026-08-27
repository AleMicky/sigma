package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.RolEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RolJpaRepository extends JpaRepository<RolEntity, UUID> {

    Optional<RolEntity> findByKeycloakRoleId(String keycloakRoleId);

    Optional<RolEntity> findByCodigoIgnoreCase(String codigo);

}