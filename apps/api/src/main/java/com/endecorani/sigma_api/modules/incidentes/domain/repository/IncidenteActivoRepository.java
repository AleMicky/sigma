package com.endecorani.sigma_api.modules.incidentes.domain.repository;

import com.endecorani.sigma_api.modules.incidentes.domain.model.IncidenteActivo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IncidenteActivoRepository {

    Page<IncidenteActivo> findAll(Pageable pageable);

    Page<IncidenteActivo> searchWithFilters(
            String search,
            String tipoIncidente,
            String prioridad,
            String estado,
            UUID activoId,
            Pageable pageable
    );

    List<IncidenteActivo> findByActivoId(UUID activoId);

    Optional<IncidenteActivo> findById(UUID id);

    IncidenteActivo save(IncidenteActivo incidenteActivo);

    void deleteById(UUID id);

    boolean existsById(UUID id);
}

