package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividad;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrdenTrabajoActividadRepository {

    Optional<OrdenTrabajoActividad> findById(UUID id);

    Page<OrdenTrabajoActividad> findAll(Pageable pageable);

    Page<OrdenTrabajoActividad> findByOrdenTrabajoId(UUID ordenTrabajoId, Pageable pageable);

    List<OrdenTrabajoActividad> findByOrdenTrabajoId(UUID ordenTrabajoId);

    OrdenTrabajoActividad save(OrdenTrabajoActividad actividad);

    void deleteById(UUID id);
}
