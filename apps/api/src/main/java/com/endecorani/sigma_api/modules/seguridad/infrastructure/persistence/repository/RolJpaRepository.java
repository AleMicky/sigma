package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.RolEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RolJpaRepository extends JpaRepository<RolEntity, UUID> {

    Optional<RolEntity> findByKeycloakRoleId(String keycloakRoleId);

    Optional<RolEntity> findByCodigoIgnoreCase(String codigo);

    @Query("""
            select r
            from RolEntity r
            where lower(r.codigo) like lower(concat('%', :query, '%'))
               or lower(r.nombre) like lower(concat('%', :query, '%'))
               or lower(r.descripcion) like lower(concat('%', :query, '%'))
            """)
    Page<RolEntity> search(@Param("query") String query, Pageable pageable);
}