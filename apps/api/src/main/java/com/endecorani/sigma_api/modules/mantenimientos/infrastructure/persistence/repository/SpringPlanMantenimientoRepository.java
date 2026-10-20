package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PlanMantenimientoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringPlanMantenimientoRepository extends JpaRepository<PlanMantenimientoEntity, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    Optional<PlanMantenimientoEntity> findByCodigoIgnoreCase(String codigo);

    List<PlanMantenimientoEntity> findByTipoActivoId(UUID tipoActivoId);

    Page<PlanMantenimientoEntity> findByTipoActivoId(UUID tipoActivoId, Pageable pageable);

    @Query("""
        SELECT p
        FROM PlanMantenimientoEntity p
        WHERE LOWER(p.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(p.descripcion) LIKE LOWER(CONCAT('%', :search, '%'))
    """)
    Page<PlanMantenimientoEntity> search(@Param("search") String search, Pageable pageable);

    @Query("""
        SELECT p
        FROM PlanMantenimientoEntity p
        WHERE p.tipoActivoId = :tipoActivoId
          AND (
               LOWER(p.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(p.descripcion) LIKE LOWER(CONCAT('%', :search, '%'))
          )
    """)
    Page<PlanMantenimientoEntity> searchByTipoActivoId(
            @Param("tipoActivoId") UUID tipoActivoId,
            @Param("search") String search,
            Pageable pageable
    );
}
