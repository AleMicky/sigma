package com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity.IncidenteInvolucradoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringIncidenteInvolucradoRepository extends JpaRepository<IncidenteInvolucradoEntity, UUID> {

    List<IncidenteInvolucradoEntity> findByIncidenteActivoId(UUID incidenteActivoId);

    Optional<IncidenteInvolucradoEntity> findByIdAndIncidenteActivoId(UUID id, UUID incidenteActivoId);
}

