package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActividadMantenimientoRepository {

    Page<ActividadMantenimiento> findAll(Pageable pageable);

    Page<ActividadMantenimiento> search(String search, Pageable pageable);

    Optional<ActividadMantenimiento> findById(UUID id);

    Optional<ActividadMantenimiento> findByCodigo(String codigo);

    List<ActividadMantenimiento> findByTipoActivoId(UUID tipoActivoId);

    ActividadMantenimiento save(ActividadMantenimiento actividad);

    void deleteById(UUID id);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);
}
