package com.endecorani.sigma_api.modules.incidentes.domain.repository;

import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteEvidencia;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IncidenteEvidenciaRepository {

    List<IncidenteEvidencia> findByIncidenteActivoId(UUID incidenteActivoId);

    Optional<IncidenteEvidencia> findById(UUID id);

    Optional<IncidenteEvidencia> findByIdAndIncidenteActivoId(UUID id, UUID incidenteActivoId);

    IncidenteEvidencia save(IncidenteEvidencia evidencia);

    void deleteById(UUID id);

    boolean existsById(UUID id);
}

