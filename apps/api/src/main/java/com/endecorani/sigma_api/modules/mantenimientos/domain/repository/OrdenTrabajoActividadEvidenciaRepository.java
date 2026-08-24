package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividadEvidencia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface OrdenTrabajoActividadEvidenciaRepository {

    OrdenTrabajoActividadEvidencia save(OrdenTrabajoActividadEvidencia entity);

    Optional<OrdenTrabajoActividadEvidencia> findById(UUID id);

    Page<OrdenTrabajoActividadEvidencia> findByOrdenTrabajoActividadId(
            UUID ordenTrabajoActividadId,
            Pageable pageable
    );

    boolean existsById(UUID id);

    void deleteById(UUID id);
}
