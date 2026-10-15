package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAsignacionEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface SpringActivoAsignacionRepository
        extends BaseJpaRepository<ActivoAsignacionEntity, UUID>, JpaSpecificationExecutor<ActivoAsignacionEntity> {

    @Query("SELECT a FROM ActivoAsignacionEntity a WHERE a.activo.id IN :activoIds AND a.fechaDevolucion IS NULL ORDER BY a.fechaAsignacion DESC")
    List<ActivoAsignacionEntity> findActiveByActivoIds(@Param("activoIds") Collection<UUID> activoIds);

    @Query("SELECT a FROM ActivoAsignacionEntity a WHERE a.activo.id = :activoId AND a.fechaDevolucion IS NULL ORDER BY a.fechaAsignacion DESC")
    List<ActivoAsignacionEntity> findActiveByActivoId(@Param("activoId") UUID activoId);
}
