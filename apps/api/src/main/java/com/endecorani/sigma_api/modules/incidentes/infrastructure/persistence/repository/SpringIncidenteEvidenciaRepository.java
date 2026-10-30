package com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.incidentes.infrastructure.persistence.entity.IncidenteEvidenciaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringIncidenteEvidenciaRepository extends JpaRepository<IncidenteEvidenciaEntity, UUID> {

    List<IncidenteEvidenciaEntity> findByIncidenteActivoId(UUID incidenteActivoId);

    Optional<IncidenteEvidenciaEntity> findByIdAndIncidenteActivoId(UUID id, UUID incidenteActivoId);
}

