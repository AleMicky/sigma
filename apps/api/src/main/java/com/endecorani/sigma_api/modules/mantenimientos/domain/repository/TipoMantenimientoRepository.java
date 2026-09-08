package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.TipoMantenimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TipoMantenimientoRepository {

    TipoMantenimiento save(TipoMantenimiento tipoMantenimiento);

    Optional<TipoMantenimiento> findById(UUID id);

    Optional<TipoMantenimiento> findByCodigo(String codigo);

    List<TipoMantenimiento> findAll();

    Page<TipoMantenimiento> findAll(Pageable pageable);

    Page<TipoMantenimiento> search(String query, Pageable pageable);

    boolean existsByCodigo(String codigo);

    boolean existsByCodigoAndIdNot(String codigo, UUID id);

    void deleteById(UUID id);
}