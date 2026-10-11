package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ControlActivoVehicularEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringControlActivoVehicularRepository extends JpaRepository<ControlActivoVehicularEntity, UUID> {

    @Override
    @EntityGraph(attributePaths = {"detalles"})
    Page<ControlActivoVehicularEntity> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"detalles"})
    Optional<ControlActivoVehicularEntity> findById(UUID id);

    @Override
    @EntityGraph(attributePaths = {"detalles"})
    List<ControlActivoVehicularEntity> findAllById(Iterable<UUID> ids);

    @EntityGraph(attributePaths = {"detalles"})
    List<ControlActivoVehicularEntity> findBySolicitudVehicularId(UUID solicitudVehicularId);

    @EntityGraph(attributePaths = {"detalles"})
    List<ControlActivoVehicularEntity> findByAsignacionVehicularId(UUID asignacionVehicularId);

    @EntityGraph(attributePaths = {"detalles"})
    List<ControlActivoVehicularEntity> findByActivoId(UUID activoId);
}
