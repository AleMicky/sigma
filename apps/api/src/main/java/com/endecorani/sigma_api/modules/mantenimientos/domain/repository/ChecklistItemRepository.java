package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChecklistItemRepository {

    Page<ChecklistItem> findAll(Pageable pageable);

    Page<ChecklistItem> findByChecklistMantenimientoId(UUID checklistMantenimientoId, Pageable pageable);

    List<ChecklistItem> findByChecklistMantenimientoIdOrderByOrdenAsc(UUID checklistMantenimientoId);

    Optional<ChecklistItem> findById(UUID id);

    Optional<ChecklistItem> findByChecklistMantenimientoIdAndCodigo(UUID checklistMantenimientoId, String codigo);

    ChecklistItem save(ChecklistItem item);

    void deleteById(UUID id);

    boolean existsById(UUID id);

    boolean existsByChecklistMantenimientoIdAndCodigoIgnoreCase(UUID checklistMantenimientoId, String codigo);

    boolean existsByChecklistMantenimientoIdAndCodigoIgnoreCaseAndIdNot(UUID checklistMantenimientoId, String codigo, UUID id);
}
