package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ProgramacionMantenimientoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringProgramacionMantenimientoRepository
        extends JpaRepository<ProgramacionMantenimientoEntity, UUID> {

    List<ProgramacionMantenimientoEntity> findByPlanMantenimientoActivoId(UUID planMantenimientoActivoId);

    Optional<ProgramacionMantenimientoEntity> findByPlanMantenimientoActivoIdAndActivoTrue(UUID planMantenimientoActivoId);

    Page<ProgramacionMantenimientoEntity> findByPlanMantenimientoActivoId(UUID planMantenimientoActivoId, Pageable pageable);

    boolean existsByPlanMantenimientoActivoIdAndActivoTrue(UUID planMantenimientoActivoId);

    boolean existsByPlanMantenimientoActivoIdAndActivoTrueAndIdNot(UUID planMantenimientoActivoId, UUID id);

    @Query("""
        SELECT p
        FROM ProgramacionMantenimientoEntity p
        JOIN p.planMantenimientoActivo pma
        JOIN pma.activo a
        JOIN pma.planMantenimiento pm
        WHERE (:planMantenimientoActivoId IS NULL OR p.planMantenimientoActivoId = :planMantenimientoActivoId)
          AND (:activoId IS NULL OR pma.activoId = :activoId)
          AND (:activo IS NULL OR p.activo = :activo)
          AND (:q IS NULL OR (
                LOWER(a.codigo) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(a.nombre) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(pm.codigo) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(pm.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
          ))
    """)
    Page<ProgramacionMantenimientoEntity> search(
            @Param("planMantenimientoActivoId") UUID planMantenimientoActivoId,
            @Param("activoId") UUID activoId,
            @Param("activo") Boolean activo,
            @Param("q") String q,
            Pageable pageable
    );
}
