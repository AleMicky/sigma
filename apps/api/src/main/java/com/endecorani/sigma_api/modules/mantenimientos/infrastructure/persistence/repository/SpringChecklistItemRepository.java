package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringChecklistItemRepository extends JpaRepository<ChecklistItemEntity, UUID> {

    List<ChecklistItemEntity> findByActividadMantenimientoAplicacionIdOrderByOrdenAsc(UUID actividadMantenimientoAplicacionId);

    Page<ChecklistItemEntity> findByActividadMantenimientoAplicacionId(UUID actividadMantenimientoAplicacionId, Pageable pageable);

    void deleteByActividadMantenimientoAplicacionId(UUID actividadMantenimientoAplicacionId);
}
