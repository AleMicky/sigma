package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoActividadEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringOrdenTrabajoActividadRepository extends JpaRepository<OrdenTrabajoActividadEntity, UUID> {

    Page<OrdenTrabajoActividadEntity> findByOrdenTrabajoId(UUID ordenTrabajoId, Pageable pageable);

    List<OrdenTrabajoActividadEntity> findByOrdenTrabajoId(UUID ordenTrabajoId);
}

