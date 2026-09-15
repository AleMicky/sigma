package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistItemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringChecklistItemRepository extends JpaRepository<ChecklistItemEntity, UUID> {

    boolean existsByChecklistMantenimientoIdAndCodigoIgnoreCase(UUID checklistMantenimientoId, String codigo);

    boolean existsByChecklistMantenimientoIdAndCodigoIgnoreCaseAndIdNot(UUID checklistMantenimientoId, String codigo, UUID id);

    Optional<ChecklistItemEntity> findByChecklistMantenimientoIdAndCodigoIgnoreCase(UUID checklistMantenimientoId, String codigo);

    Page<ChecklistItemEntity> findByChecklistMantenimientoId(UUID checklistMantenimientoId, Pageable pageable);

    List<ChecklistItemEntity> findByChecklistMantenimientoIdOrderByOrdenAsc(UUID checklistMantenimientoId);
}
