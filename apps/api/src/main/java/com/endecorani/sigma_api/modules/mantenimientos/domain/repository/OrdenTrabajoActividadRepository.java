package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividad;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrdenTrabajoActividadRepository {

    OrdenTrabajoActividad save(OrdenTrabajoActividad entity);

    Optional<OrdenTrabajoActividad> findById(UUID id);

    List<OrdenTrabajoActividad> findAll();

    Page<OrdenTrabajoActividad> findAll(Pageable pageable);

    boolean existsById(UUID id);

    void deleteById(UUID id);

    Page<OrdenTrabajoActividad> findByOrdenTrabajoId(
            UUID ordenTrabajoId,
            Pageable pageable
    );
}
