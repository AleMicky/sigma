package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActividadMantenimientoAplicacionRepository {

    ActividadMantenimientoAplicacion save(ActividadMantenimientoAplicacion domain);

    Optional<ActividadMantenimientoAplicacion> findById(UUID id);

    List<ActividadMantenimientoAplicacion> findAll();

    Page<ActividadMantenimientoAplicacion> findAll(Pageable pageable);

    Page<ActividadMantenimientoAplicacion> findByActividadMantenimientoId(
            UUID actividadMantenimientoId,
            Pageable pageable
    );

    Page<ActividadMantenimientoAplicacion> findByTipoActivoId(
            UUID tipoActivoId,
            Pageable pageable
    );

    boolean existsById(UUID id);

    void deleteById(UUID id);

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
