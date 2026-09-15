package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistMantenimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChecklistMantenimientoRepository {

    Page<ChecklistMantenimiento> findAll(Pageable pageable);

    Page<ChecklistMantenimiento> search(String search, Pageable pageable);

    Optional<ChecklistMantenimiento> findById(UUID id);

    Optional<ChecklistMantenimiento> findByCodigo(String codigo);

    List<ChecklistMantenimiento> findByActividadMantenimientoId(UUID actividadMantenimientoId);

    Page<ChecklistMantenimiento> findByActividadMantenimientoId(UUID actividadMantenimientoId, Pageable pageable);

    ChecklistMantenimiento save(ChecklistMantenimiento checklist);

    void deleteById(UUID id);

    boolean existsById(UUID id);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);
}
