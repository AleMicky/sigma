package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ControlActivoDetalleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringControlActivoDetalleRepository extends JpaRepository<ControlActivoDetalleEntity, UUID> {

    Page<ControlActivoDetalleEntity> findByControlActivoId(UUID controlActivoId, Pageable pageable);

    List<ControlActivoDetalleEntity> findByControlActivoId(UUID controlActivoId);
}
