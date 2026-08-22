package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.GrupoAprobadorDetalleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringGrupoAprobadorDetalleRepository
        extends JpaRepository<GrupoAprobadorDetalleEntity, UUID> {

    Page<GrupoAprobadorDetalleEntity> findByGrupoAprobadorId(
            UUID grupoAprobadorId,
            Pageable pageable
    );
}
