package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActividad;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlanMantenimientoActividadRepository {

    List<PlanMantenimientoActividad> findByPlanMantenimientoId(UUID planMantenimientoId);

    Page<PlanMantenimientoActividad> findByPlanMantenimientoId(UUID planMantenimientoId, Pageable pageable);

    Optional<PlanMantenimientoActividad> findById(UUID id);

    long countByPlanMantenimientoId(UUID planMantenimientoId);

    PlanMantenimientoActividad save(PlanMantenimientoActividad actividad);

    void deleteById(UUID id);

    boolean existsByPlanMantenimientoIdAndActividadMantenimientoAplicacionId(
            UUID planMantenimientoId,
            UUID actividadMantenimientoAplicacionId
    );

    boolean existsByPlanMantenimientoIdAndActividadMantenimientoAplicacionIdAndIdNot(
            UUID planMantenimientoId,
            UUID actividadMantenimientoAplicacionId,
            UUID id
    );
}
