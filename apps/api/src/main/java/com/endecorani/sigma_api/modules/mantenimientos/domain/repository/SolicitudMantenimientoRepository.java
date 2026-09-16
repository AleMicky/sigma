package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface SolicitudMantenimientoRepository {

    Page<SolicitudMantenimiento> findAll(Pageable pageable);

    Page<SolicitudMantenimiento> search(String search, Pageable pageable);

    Optional<SolicitudMantenimiento> findById(UUID id);

    SolicitudMantenimiento save(SolicitudMantenimiento solicitud);

    void deleteById(UUID id);

    boolean existsByNumeroIgnoreCase(String numero);

    boolean existsByNumeroIgnoreCaseAndIdNot(String numero, UUID id);

    SolicitudMantenimientoResumenProjection obtenerResumen(UUID solicitanteId, UUID aprobadorId, UUID supervisorId, UUID responsableId);
    
    Page<SolicitudMantenimiento> findAll(com.endecorani.sigma_api.modules.mantenimientos.domain.criteria.SolicitudMantenimientoSearchCriteria criteria, Pageable pageable);
}
