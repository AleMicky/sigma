package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrdenTrabajoRepository {

    OrdenTrabajo save(OrdenTrabajo entity);

    Optional<OrdenTrabajo> findById(UUID id);

    List<OrdenTrabajo> findAll();

    Page<OrdenTrabajo> findAll(Pageable pageable);

    boolean existsById(UUID id);

    void deleteById(UUID id);

    boolean existsBySolicitudMantenimientoId(UUID solicitudMantenimientoId);

    Page<OrdenTrabajo> findBySolicitudMantenimientoId(
            UUID solicitudMantenimientoId,
            Pageable pageable
    );

    boolean existsBySolicitudMantenimientoIdAndIdNot(
            UUID solicitudMantenimientoId,
            UUID id
    );

    Page<OrdenTrabajo> search(
            String query,
            Pageable pageable
    );
}
