package com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.seguridad.infrastructure.persistence.entity.UsuarioRolEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRolJpaRepository extends JpaRepository<UsuarioRolEntity, UUID> {

    List<UsuarioRolEntity> findByUsuarioId(UUID usuarioId);

    @Query("SELECT ur FROM UsuarioRolEntity ur JOIN FETCH ur.rol WHERE ur.usuario.id = :usuarioId AND ur.activo = true")
    List<UsuarioRolEntity> findActiveRolesByUsuarioId(@Param("usuarioId") UUID usuarioId);

    @Query("SELECT ur FROM UsuarioRolEntity ur JOIN FETCH ur.usuario WHERE ur.rol.id = :rolId AND ur.activo = true")
    List<UsuarioRolEntity> findActiveUsuariosByRolId(@Param("rolId") UUID rolId);

    Optional<UsuarioRolEntity> findByUsuarioIdAndRolId(UUID usuarioId, UUID rolId);

    void deleteByUsuarioId(UUID usuarioId);
}
