package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChecklistItemRepository {

    ChecklistItem save(ChecklistItem domain);

    Optional<ChecklistItem> findById(UUID id);

    List<ChecklistItem> findAll();

    Page<ChecklistItem> findAll(Pageable pageable);

    Page<ChecklistItem> findByChecklistMantenimientoId(
            UUID checklistMantenimientoId,
            Pageable pageable
    );

    boolean existsById(UUID id);

    void deleteById(UUID id);

    boolean existsByChecklistMantenimientoIdAndCodigoIgnoreCase(
            UUID checklistMantenimientoId,
            String codigo
    );

    boolean existsByChecklistMantenimientoIdAndCodigoIgnoreCaseAndIdNot(
            UUID checklistMantenimientoId,
            String codigo,
            UUID id
    );

    Page<ChecklistItem> search(String query, Pageable pageable);

    Page<ChecklistItem> searchByChecklistMantenimientoId(
            UUID checklistMantenimientoId,
            String query,
            Pageable pageable
    );
}
