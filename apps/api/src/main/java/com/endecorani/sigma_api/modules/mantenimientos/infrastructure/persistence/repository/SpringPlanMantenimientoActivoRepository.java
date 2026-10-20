package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PlanMantenimientoActivoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SpringPlanMantenimientoActivoRepository
        extends JpaRepository<PlanMantenimientoActivoEntity, UUID> {

    List<PlanMantenimientoActivoEntity> findByPlanMantenimientoIdOrderByFechaInicioDesc(UUID planMantenimientoId);

    List<PlanMantenimientoActivoEntity> findByPlanMantenimientoIdAndEstadoActivoOrderByFechaInicioDesc(UUID planMantenimientoId, Boolean estadoActivo);

    List<PlanMantenimientoActivoEntity> findByActivoIdOrderByFechaInicioDesc(UUID activoId);

    Page<PlanMantenimientoActivoEntity> findByPlanMantenimientoId(UUID planMantenimientoId, Pageable pageable);

    Page<PlanMantenimientoActivoEntity> findByActivoId(UUID activoId, Pageable pageable);

    boolean existsByPlanMantenimientoIdAndActivoIdAndEstadoActivoTrue(UUID planMantenimientoId, UUID activoId);

    boolean existsByPlanMantenimientoIdAndActivoIdAndEstadoActivoTrueAndIdNot(UUID planMantenimientoId, UUID activoId, UUID id);

    long countByPlanMantenimientoId(UUID planMantenimientoId);

    @Query("""
        SELECT p
        FROM PlanMantenimientoActivoEntity p
        WHERE (:planMantenimientoId IS NULL OR p.planMantenimientoId = :planMantenimientoId)
          AND (:activoId IS NULL OR p.activoId = :activoId)
          AND (:activo IS NULL OR p.estadoActivo = :activo)
    """)
    Page<PlanMantenimientoActivoEntity> search(
            @Param("planMantenimientoId") UUID planMantenimientoId,
            @Param("activoId") UUID activoId,
            @Param("activo") Boolean activo,
            Pageable pageable
    );
}
