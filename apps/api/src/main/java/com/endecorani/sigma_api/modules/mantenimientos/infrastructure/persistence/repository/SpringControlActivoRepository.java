package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ControlActivoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringControlActivoRepository extends JpaRepository<ControlActivoEntity, UUID> {

    List<ControlActivoEntity> findBySolicitudMantenimientoId(UUID solicitudMantenimientoId);

    List<ControlActivoEntity> findByOrdenTrabajoId(UUID ordenTrabajoId);

    List<ControlActivoEntity> findByActivoId(UUID activoId);
}
