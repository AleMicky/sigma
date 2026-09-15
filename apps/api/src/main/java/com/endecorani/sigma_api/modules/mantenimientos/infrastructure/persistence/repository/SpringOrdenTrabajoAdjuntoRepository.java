package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoAdjuntoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringOrdenTrabajoAdjuntoRepository extends JpaRepository<OrdenTrabajoAdjuntoEntity, UUID> {

    Page<OrdenTrabajoAdjuntoEntity> findByOrdenTrabajoId(UUID ordenTrabajoId, Pageable pageable);

    List<OrdenTrabajoAdjuntoEntity> findByOrdenTrabajoId(UUID ordenTrabajoId);
}
