package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ProgramacionMantenimientoEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringProgramacionMantenimientoRepository
        extends JpaRepository<ProgramacionMantenimientoEntity, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM ProgramacionMantenimientoEntity p WHERE p.id = :id")
    Optional<ProgramacionMantenimientoEntity> findByIdWithLock(@Param("id") UUID id);

    List<ProgramacionMantenimientoEntity> findByPlanMantenimientoActivoId(UUID planMantenimientoActivoId);

    List<ProgramacionMantenimientoEntity> findByActivoTrue();

    Optional<ProgramacionMantenimientoEntity> findByPlanMantenimientoActivoIdAndActivoTrue(UUID planMantenimientoActivoId);

    Page<ProgramacionMantenimientoEntity> findByPlanMantenimientoActivoId(UUID planMantenimientoActivoId, Pageable pageable);

    boolean existsByPlanMantenimientoActivoIdAndActivoTrue(UUID planMantenimientoActivoId);

    boolean existsByPlanMantenimientoActivoIdAndActivoTrueAndIdNot(UUID planMantenimientoActivoId, UUID id);

    @Query(
        value = """
            SELECT p
            FROM ProgramacionMantenimientoEntity p
            LEFT JOIN p.planMantenimientoActivo pma
            LEFT JOIN pma.activo a
            LEFT JOIN pma.planMantenimiento pm
            WHERE (:planMantenimientoActivoId IS NULL OR p.planMantenimientoActivoId = :planMantenimientoActivoId)
              AND (:activoId IS NULL OR pma.activoId = :activoId)
              AND (:activo IS NULL OR p.activo = :activo)
              AND (:q IS NULL OR (
                    LOWER(a.codigo) LIKE LOWER(CONCAT('%', :q, '%')) OR
                    LOWER(a.nombre) LIKE LOWER(CONCAT('%', :q, '%')) OR
                    LOWER(pm.codigo) LIKE LOWER(CONCAT('%', :q, '%')) OR
                    LOWER(pm.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
              ))
        """,
        countQuery = """
            SELECT COUNT(p)
            FROM ProgramacionMantenimientoEntity p
            LEFT JOIN p.planMantenimientoActivo pma
            LEFT JOIN pma.activo a
            LEFT JOIN pma.planMantenimiento pm
            WHERE (:planMantenimientoActivoId IS NULL OR p.planMantenimientoActivoId = :planMantenimientoActivoId)
              AND (:activoId IS NULL OR pma.activoId = :activoId)
              AND (:activo IS NULL OR p.activo = :activo)
              AND (:q IS NULL OR (
                    LOWER(a.codigo) LIKE LOWER(CONCAT('%', :q, '%')) OR
                    LOWER(a.nombre) LIKE LOWER(CONCAT('%', :q, '%')) OR
                    LOWER(pm.codigo) LIKE LOWER(CONCAT('%', :q, '%')) OR
                    LOWER(pm.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
              ))
        """
    )
    Page<ProgramacionMantenimientoEntity> search(
            @Param("planMantenimientoActivoId") UUID planMantenimientoActivoId,
            @Param("activoId") UUID activoId,
            @Param("activo") Boolean activo,
            @Param("q") String q,
            Pageable pageable
    );
}
