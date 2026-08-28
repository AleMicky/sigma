package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.UsuarioEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioJpaRepository extends JpaRepository<UsuarioEntity, UUID> {

    Optional<UsuarioEntity> findByKeycloakUserId(String keycloakUserId);

    Optional<UsuarioEntity> findByUsernameIgnoreCase(String username);

    Optional<UsuarioEntity> findByEmailIgnoreCase(String email);

    @Query("""
            select u
            from UsuarioEntity u
            where lower(u.username) like lower(concat('%', :query, '%'))
               or lower(u.nombre) like lower(concat('%', :query, '%'))
               or lower(u.email) like lower(concat('%', :query, '%'))
            """)
    Page<UsuarioEntity> search(@Param("query") String query, Pageable pageable);
}