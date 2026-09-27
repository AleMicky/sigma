package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ControlActivoVehicularEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringControlActivoVehicularRepository extends JpaRepository<ControlActivoVehicularEntity, UUID> {

    List<ControlActivoVehicularEntity> findBySolicitudVehicularId(UUID solicitudVehicularId);

    List<ControlActivoVehicularEntity> findByAsignacionVehicularId(UUID asignacionVehicularId);

    List<ControlActivoVehicularEntity> findByActivoId(UUID activoId);
}
