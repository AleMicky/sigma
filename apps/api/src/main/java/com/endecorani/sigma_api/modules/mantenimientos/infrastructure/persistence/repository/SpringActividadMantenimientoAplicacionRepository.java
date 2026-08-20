package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ActividadMantenimientoAplicacionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringActividadMantenimientoAplicacionRepository
        extends JpaRepository<
        ActividadMantenimientoAplicacionEntity,
        UUID
        > {

    Page<ActividadMantenimientoAplicacionEntity>
    findByActividadMantenimientoId(
            UUID actividadMantenimientoId,
            Pageable pageable
    );

    Page<ActividadMantenimientoAplicacionEntity>
    findByTipoActivoId(
            UUID tipoActivoId,
            Pageable pageable
    );

    boolean existsByActividadMantenimientoIdAndTipoActivoIdAndComponenteId(
            UUID actividadMantenimientoId,
            UUID tipoActivoId,
            UUID componenteId
    );

    boolean existsByActividadMantenimientoIdAndTipoActivoIdAndComponenteIdAndIdNot(
            UUID actividadMantenimientoId,
            UUID tipoActivoId,
            UUID componenteId,
            UUID id
    );
}
