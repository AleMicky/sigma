package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProgramacionMantenimientoRepository {

    Page<ProgramacionMantenimiento> findAll(Pageable pageable);

    Optional<ProgramacionMantenimiento> findById(UUID id);

    Optional<ProgramacionMantenimiento> findByIdWithLock(UUID id);

    List<ProgramacionMantenimiento> findByPlanMantenimientoActivoId(UUID planMantenimientoActivoId);

    List<ProgramacionMantenimiento> findByActivoTrue();

    Optional<ProgramacionMantenimiento> findByPlanMantenimientoActivoIdAndActivoTrue(UUID planMantenimientoActivoId);

    Page<ProgramacionMantenimiento> findByPlanMantenimientoActivoId(UUID planMantenimientoActivoId, Pageable pageable);

    Page<ProgramacionMantenimiento> search(UUID planMantenimientoActivoId, UUID activoId, Boolean activo, String q, Pageable pageable);

    ProgramacionMantenimiento save(ProgramacionMantenimiento item);

    /** REQ-MANT-010: fuerza el flush para traducir la violación del índice único a 409. */
    ProgramacionMantenimiento saveAndFlush(ProgramacionMantenimiento item);

    void deleteById(UUID id);

    boolean existsByPlanMantenimientoActivoIdAndActivoTrue(UUID planMantenimientoActivoId);

    boolean existsByPlanMantenimientoActivoIdAndActivoTrueAndIdNot(UUID planMantenimientoActivoId, UUID id);
}
