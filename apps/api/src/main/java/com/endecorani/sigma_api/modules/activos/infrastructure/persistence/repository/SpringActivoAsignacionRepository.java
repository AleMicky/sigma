package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAsignacionEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringActivoAsignacionRepository
        extends BaseJpaRepository<ActivoAsignacionEntity, UUID>, JpaSpecificationExecutor<ActivoAsignacionEntity> {

    @Query("SELECT a FROM ActivoAsignacionEntity a WHERE a.activo.id IN :activoIds AND a.fechaDevolucion IS NULL ORDER BY a.fechaAsignacion DESC")
    List<ActivoAsignacionEntity> findActiveByActivoIds(@Param("activoIds") Collection<UUID> activoIds);

    @Query("SELECT a FROM ActivoAsignacionEntity a WHERE a.activo.id = :activoId AND a.fechaDevolucion IS NULL ORDER BY a.fechaAsignacion DESC")
    List<ActivoAsignacionEntity> findActiveByActivoId(@Param("activoId") UUID activoId);

    @Query("SELECT a FROM ActivoAsignacionEntity a WHERE a.activo.id = :activoId AND a.fechaDevolucion IS NULL ORDER BY a.fechaAsignacion DESC, a.id DESC")
    Optional<ActivoAsignacionEntity> findOpenByActivoId(@Param("activoId") UUID activoId);

    /**
     * Solapamiento con intervalos semiabiertos: el extremo superior de la
     * asignación existente no se incluye, de modo que cerrar una asignación
     * exactamente cuando empieza la siguiente no cuenta como solape.
     */
    @Query("""
            SELECT CASE WHEN COUNT(a) > 0 THEN TRUE ELSE FALSE END
            FROM ActivoAsignacionEntity a
            WHERE a.activo.id = :activoId
              AND (:excludeId IS NULL OR a.id <> :excludeId)
              AND (:fechaDevolucion IS NULL OR a.fechaAsignacion < :fechaDevolucion)
              AND (a.fechaDevolucion IS NULL OR a.fechaDevolucion > :fechaAsignacion)
            """)
    boolean existsOverlappingByActivoId(
            @Param("activoId") UUID activoId,
            @Param("fechaAsignacion") LocalDateTime fechaAsignacion,
            @Param("fechaDevolucion") LocalDateTime fechaDevolucion,
            @Param("excludeId") UUID excludeId
    );
}
