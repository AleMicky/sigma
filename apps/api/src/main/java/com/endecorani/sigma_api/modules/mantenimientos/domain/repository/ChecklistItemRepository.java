package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChecklistItemRepository {

    Optional<ChecklistItem> findById(UUID id);

    Page<ChecklistItem> findAll(Pageable pageable);

    Page<ChecklistItem> findByActividadMantenimientoAplicacionId(UUID aplicacionId, Pageable pageable);

    List<ChecklistItem> findByActividadMantenimientoAplicacionId(UUID aplicacionId);

    ChecklistItem save(ChecklistItem item);

    List<ChecklistItem> saveAll(List<ChecklistItem> items);

    void deleteById(UUID id);

    void deleteByActividadMantenimientoAplicacionId(UUID aplicacionId);
}
