package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;


import com.endecorani.sigma_api.modules.mantenimientos.domain.model.TipoMantenimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface TipoMantenimientoRepository {

    Page<TipoMantenimiento> findAll(Pageable pageable);

    Page<TipoMantenimiento> search(String search, Pageable pageable);

    Optional<TipoMantenimiento> findById(UUID id);

    TipoMantenimiento save(TipoMantenimiento tipo);

    void deleteById(UUID id);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);
}
