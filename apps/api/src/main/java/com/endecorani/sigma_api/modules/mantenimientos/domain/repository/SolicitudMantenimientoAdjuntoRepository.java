package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoAdjunto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SolicitudMantenimientoAdjuntoRepository {

    SolicitudMantenimientoAdjunto save(
            SolicitudMantenimientoAdjunto domain
    );

    Optional<SolicitudMantenimientoAdjunto> findById(UUID id);


    Page<SolicitudMantenimientoAdjunto> findBySolicitudMantenimientoId(
            UUID solicitudMantenimientoId,
            Pageable pageable
    );

    List<SolicitudMantenimientoAdjunto> findBySolicitudMantenimientoId(
            UUID solicitudMantenimientoId
    );

    boolean existsById(UUID id);

    void deleteById(UUID id);
}


