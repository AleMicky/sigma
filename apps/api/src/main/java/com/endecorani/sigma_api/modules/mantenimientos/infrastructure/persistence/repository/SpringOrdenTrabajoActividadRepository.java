package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoActividadEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringOrdenTrabajoActividadRepository
        extends JpaRepository<OrdenTrabajoActividadEntity, UUID> {

    Page<OrdenTrabajoActividadEntity> findByOrdenTrabajoId(
            UUID ordenTrabajoId,
            Pageable pageable
    );
}
