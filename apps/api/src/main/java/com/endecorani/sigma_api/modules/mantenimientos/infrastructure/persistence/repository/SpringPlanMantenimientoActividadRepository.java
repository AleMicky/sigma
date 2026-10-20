package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PlanMantenimientoActividadEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringPlanMantenimientoActividadRepository
        extends JpaRepository<PlanMantenimientoActividadEntity, UUID> {

    List<PlanMantenimientoActividadEntity> findByPlanMantenimientoIdOrderByOrdenAsc(UUID planMantenimientoId);

    Page<PlanMantenimientoActividadEntity> findByPlanMantenimientoId(UUID planMantenimientoId, Pageable pageable);

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
