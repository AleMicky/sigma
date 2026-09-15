package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface OrdenTrabajoRepository {

    Page<OrdenTrabajo> findAll(Pageable pageable);

    Page<OrdenTrabajo> search(String search, Pageable pageable);

    Optional<OrdenTrabajo> findById(UUID id);

    Optional<OrdenTrabajo> findByNumero(String numero);

    Optional<OrdenTrabajo> findBySolicitudMantenimientoId(UUID solicitudMantenimientoId);

    OrdenTrabajo save(OrdenTrabajo ordenTrabajo);

    void deleteById(UUID id);

    boolean existsByNumeroIgnoreCase(String numero);

    boolean existsByNumeroIgnoreCaseAndIdNot(String numero, UUID id);

    boolean existsBySolicitudMantenimientoId(UUID solicitudMantenimientoId);

    boolean existsBySolicitudMantenimientoIdAndIdNot(UUID solicitudMantenimientoId, UUID id);
}
