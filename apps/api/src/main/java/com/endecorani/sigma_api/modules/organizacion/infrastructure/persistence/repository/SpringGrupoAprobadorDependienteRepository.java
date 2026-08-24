package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.GrupoAprobadorDependienteEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringGrupoAprobadorDependienteRepository
        extends JpaRepository<GrupoAprobadorDependienteEntity, UUID> {

    Optional<GrupoAprobadorDependienteEntity> findByIdAndGrupoAprobadorId(UUID id, UUID grupoAprobadorId);

    Page<GrupoAprobadorDependienteEntity> findByGrupoAprobadorId(
            UUID grupoAprobadorId,
            Pageable pageable
    );

    boolean existsByIdAndGrupoAprobadorId(UUID id, UUID grupoAprobadorId);

    boolean existsByGrupoAprobadorIdAndEmpleadoId(UUID grupoAprobadorId, UUID empleadoId);

    boolean existsByGrupoAprobadorIdAndEmpleadoIdAndIdNot(
            UUID grupoAprobadorId,
            UUID empleadoId,
            UUID id
    );
}