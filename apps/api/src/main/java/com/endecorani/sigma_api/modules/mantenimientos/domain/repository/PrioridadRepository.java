package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;


import com.endecorani.sigma_api.modules.mantenimientos.domain.model.Prioridad;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface PrioridadRepository {

    Page<Prioridad> findAll(Pageable pageable);

    Page<Prioridad> search(String search, Pageable pageable);

    Optional<Prioridad> findById(UUID id);

    Prioridad save(Prioridad prioridad);

    void deleteById(UUID id);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);

    boolean existsByPorDefectoTrue();

    boolean existsByPorDefectoTrueAndIdNot(UUID id);
}