package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoAdjunto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface OrdenTrabajoAdjuntoRepository {

    OrdenTrabajoAdjunto save(OrdenTrabajoAdjunto entity);

    Optional<OrdenTrabajoAdjunto> findById(UUID id);

    Page<OrdenTrabajoAdjunto> findByOrdenTrabajoId(
            UUID ordenTrabajoId,
            Pageable pageable
    );

    boolean existsById(UUID id);

    void deleteById(UUID id);
}
