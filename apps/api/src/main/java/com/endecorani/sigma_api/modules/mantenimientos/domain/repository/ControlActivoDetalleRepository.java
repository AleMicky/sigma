package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivoDetalle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ControlActivoDetalleRepository {

    ControlActivoDetalle save(ControlActivoDetalle entity);

    Optional<ControlActivoDetalle> findById(UUID id);

    List<ControlActivoDetalle> findAll();

    Page<ControlActivoDetalle> findAll(Pageable pageable);

    boolean existsById(UUID id);

    void deleteById(UUID id);

    boolean existsByControlActivoIdAndAccesorioId(
            UUID controlActivoId,
            UUID accesorioId
    );

    boolean existsByControlActivoIdAndAccesorioIdAndIdNot(
            UUID controlActivoId,
            UUID accesorioId,
            UUID id
    );

    Page<ControlActivoDetalle> findByControlActivoId(
            UUID controlActivoId,
            Pageable pageable
    );
}
