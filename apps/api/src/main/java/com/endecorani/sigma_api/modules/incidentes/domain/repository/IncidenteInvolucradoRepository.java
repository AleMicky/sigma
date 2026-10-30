package com.endecorani.sigma_api.modules.incidentes.domain.repository;

import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteInvolucrado;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IncidenteInvolucradoRepository {

    List<IncidenteInvolucrado> findByIncidenteActivoId(UUID incidenteActivoId);

    Optional<IncidenteInvolucrado> findById(UUID id);

    Optional<IncidenteInvolucrado> findByIdAndIncidenteActivoId(UUID id, UUID incidenteActivoId);

    IncidenteInvolucrado save(IncidenteInvolucrado involucrado);

    void deleteById(UUID id);

    boolean existsById(UUID id);
}

