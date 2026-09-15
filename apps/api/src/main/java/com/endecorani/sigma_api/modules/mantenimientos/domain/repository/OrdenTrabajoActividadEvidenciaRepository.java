package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividadEvidencia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrdenTrabajoActividadEvidenciaRepository {

    Optional<OrdenTrabajoActividadEvidencia> findById(UUID id);

    Page<OrdenTrabajoActividadEvidencia> findByOrdenTrabajoActividadId(UUID ordenTrabajoActividadId, Pageable pageable);

    List<OrdenTrabajoActividadEvidencia> findByOrdenTrabajoActividadId(UUID ordenTrabajoActividadId);

    OrdenTrabajoActividadEvidencia save(OrdenTrabajoActividadEvidencia evidencia);

    void deleteById(UUID id);
}
