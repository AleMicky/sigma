package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAsignacion;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface ActivoAsignacionRepository extends CrudRepository<ActivoAsignacion, UUID> {

    Page<ActivoAsignacion> findAll(ActivoAsignacionSearchCriteria criteria, Pageable pageable);

    /**
     * Asignación abierta (sin fecha de devolución) de un activo, si existe.
     * Tras V180 como máximo hay una por activo.
     */
    Optional<ActivoAsignacion> findOpenByActivoId(UUID activoId);

    /**
     * Indica si existe otra asignación del mismo activo cuyo periodo solapa
     * con [fechaAsignacion, fechaDevolucion). Un {@code null} en
     * fechaDevolucion representa un periodo abierto.
     */
    boolean existsOverlappingByActivoId(
            UUID activoId,
            LocalDateTime fechaAsignacion,
            LocalDateTime fechaDevolucion,
            UUID excludeId
    );

}
