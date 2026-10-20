package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PlanMantenimientoRepository {

    Page<PlanMantenimiento> findAll(Pageable pageable);

    Page<PlanMantenimiento> search(String search, Pageable pageable);

    Page<PlanMantenimiento> findByTipoActivoId(UUID tipoActivoId, Pageable pageable);

    Page<PlanMantenimiento> searchByTipoActivoId(UUID tipoActivoId, String search, Pageable pageable);

    List<PlanMantenimiento> findByTipoActivoId(UUID tipoActivoId);

    Optional<PlanMantenimiento> findById(UUID id);

    Optional<PlanMantenimiento> findByCodigo(String codigo);

    PlanMantenimiento save(PlanMantenimiento plan);

    void deleteById(UUID id);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);
}
