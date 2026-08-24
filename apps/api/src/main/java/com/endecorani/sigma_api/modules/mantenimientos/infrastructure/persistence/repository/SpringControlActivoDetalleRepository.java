package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ControlActivoDetalleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringControlActivoDetalleRepository
        extends JpaRepository<ControlActivoDetalleEntity, UUID> {

    boolean existsByControlActivoIdAndAccesorioId(
            UUID controlActivoId,
            UUID accesorioId
    );

    boolean existsByControlActivoIdAndAccesorioIdAndIdNot(
            UUID controlActivoId,
            UUID accesorioId,
            UUID id
    );

    Page<ControlActivoDetalleEntity> findByControlActivoId(
            UUID controlActivoId,
            Pageable pageable
    );
}
