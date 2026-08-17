package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistMantenimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChecklistMantenimientoRepository {

    ChecklistMantenimiento save(ChecklistMantenimiento domain);

    Optional<ChecklistMantenimiento> findById(UUID id);

    List<ChecklistMantenimiento> findAll();

    Page<ChecklistMantenimiento> findAll(Pageable pageable);

    Page<ChecklistMantenimiento> findByActividadMantenimientoId(
            UUID actividadMantenimientoId,
            Pageable pageable
    );

    boolean existsById(UUID id);

    void deleteById(UUID id);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    boolean existsByActividadMantenimientoIdAndCodigoIgnoreCase(
            UUID actividadMantenimientoId,
            String codigo
    );

    boolean existsByActividadMantenimientoIdAndCodigoIgnoreCaseAndIdNot(
            UUID actividadMantenimientoId,
            String codigo,
            UUID id
    );

    Page<ChecklistMantenimiento> search(String query, Pageable pageable);

    Page<ChecklistMantenimiento> searchByActividadMantenimientoId(
            UUID actividadMantenimientoId,
            String query,
            Pageable pageable
    );
}
