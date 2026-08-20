package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.specification;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoAdjuntoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringSolicitudMantenimientoAdjuntoRepository
        extends JpaRepository<
        SolicitudMantenimientoAdjuntoEntity,
        UUID
        > {

    Page<SolicitudMantenimientoAdjuntoEntity>
    findBySolicitudMantenimientoId(
            UUID solicitudMantenimientoId,
            Pageable pageable
    );
}
