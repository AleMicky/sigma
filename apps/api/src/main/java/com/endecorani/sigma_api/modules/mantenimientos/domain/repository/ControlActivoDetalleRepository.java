package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivoDetalle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ControlActivoDetalleRepository {

    Optional<ControlActivoDetalle> findById(UUID id);

    Page<ControlActivoDetalle> findAll(Pageable pageable);

    Page<ControlActivoDetalle> findByControlActivoId(UUID controlActivoId, Pageable pageable);

    List<ControlActivoDetalle> findByControlActivoId(UUID controlActivoId);

    ControlActivoDetalle save(ControlActivoDetalle detalle);

    void deleteById(UUID id);
}
