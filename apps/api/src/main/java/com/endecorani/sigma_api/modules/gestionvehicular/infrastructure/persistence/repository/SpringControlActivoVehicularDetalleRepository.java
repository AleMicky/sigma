package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ControlActivoVehicularDetalleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringControlActivoVehicularDetalleRepository extends JpaRepository<ControlActivoVehicularDetalleEntity, UUID> {

    Page<ControlActivoVehicularDetalleEntity> findByControlActivoId(UUID controlActivoId, Pageable pageable);

    List<ControlActivoVehicularDetalleEntity> findByControlActivoId(UUID controlActivoId);
}
