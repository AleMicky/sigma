package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlanMantenimientoActivoRepository {

    Page<PlanMantenimientoActivo> findAll(Pageable pageable);

    Optional<PlanMantenimientoActivo> findById(UUID id);

    List<PlanMantenimientoActivo> findByPlanMantenimientoId(UUID planMantenimientoId);

    List<PlanMantenimientoActivo> findByPlanMantenimientoIdAndActivo(UUID planMantenimientoId, Boolean activo);

    List<PlanMantenimientoActivo> findByActivoId(UUID activoId);

    Page<PlanMantenimientoActivo> findByPlanMantenimientoId(UUID planMantenimientoId, Pageable pageable);

    Page<PlanMantenimientoActivo> findByActivoId(UUID activoId, Pageable pageable);

    PlanMantenimientoActivo save(PlanMantenimientoActivo item);

    void deleteById(UUID id);

    boolean existsByPlanMantenimientoIdAndActivoIdAndActivoTrue(UUID planMantenimientoId, UUID activoId);

    boolean existsByPlanMantenimientoIdAndActivoIdAndActivoTrueAndIdNot(UUID planMantenimientoId, UUID activoId, UUID id);

    long countByPlanMantenimientoId(UUID planMantenimientoId);
}
