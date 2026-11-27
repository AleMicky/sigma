package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoActividadEvidenciaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringOrdenTrabajoActividadEvidenciaRepository extends JpaRepository<OrdenTrabajoActividadEvidenciaEntity, UUID> {

    Optional<OrdenTrabajoActividadEvidenciaEntity> findByIdAndOrdenTrabajoActividadId(UUID id, UUID ordenTrabajoActividadId);

    Page<OrdenTrabajoActividadEvidenciaEntity> findByOrdenTrabajoActividadId(UUID ordenTrabajoActividadId, Pageable pageable);

    List<OrdenTrabajoActividadEvidenciaEntity> findByOrdenTrabajoActividadId(UUID ordenTrabajoActividadId);
}
