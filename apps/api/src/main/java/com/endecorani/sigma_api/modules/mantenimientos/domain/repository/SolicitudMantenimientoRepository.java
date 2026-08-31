package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.criteria.SolicitudMantenimientoSearchCriteria;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SolicitudMantenimientoRepository {

    SolicitudMantenimiento save(SolicitudMantenimiento domain);

    Optional<SolicitudMantenimiento> findById(UUID id);

    List<SolicitudMantenimiento> findAll();

    Page<SolicitudMantenimiento> findAll(Pageable pageable);

    Page<SolicitudMantenimiento> findAll(SolicitudMantenimientoSearchCriteria criteria, Pageable pageable);

    boolean existsById(UUID id);

    void deleteById(UUID id);

    boolean existsByNumeroIgnoreCase(String numero);

    boolean existsByNumeroIgnoreCaseAndIdNot(
            String numero,
            UUID id
    );

    Page<SolicitudMantenimiento> findByActivoId(
            UUID activoId,
            Pageable pageable
    );

    Page<SolicitudMantenimiento> findByEstado(
            String estado,
            Pageable pageable
    );

    Page<SolicitudMantenimiento> findBySolicitanteId(
            UUID solicitanteId,
            Pageable pageable
    );

    Page<SolicitudMantenimiento> findByResponsableId(
            UUID responsableId,
            Pageable pageable
    );

    Page<SolicitudMantenimiento> search(
            String query,
            Pageable pageable
    );
}
