package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActividadMantenimientoAplicacionRepository {

    Optional<ActividadMantenimientoAplicacion> findById(UUID id);

    Page<ActividadMantenimientoAplicacion> findAll(Pageable pageable);

    Page<ActividadMantenimientoAplicacion> findByActividadMantenimientoId(UUID actividadMantenimientoId, Pageable pageable);

    List<ActividadMantenimientoAplicacion> findByActividadMantenimientoId(UUID actividadMantenimientoId);

    List<ActividadMantenimientoAplicacion> findByTipoActivoId(UUID tipoActivoId);

    ActividadMantenimientoAplicacion save(ActividadMantenimientoAplicacion aplicacion);

    void deleteById(UUID id);

    boolean existsByActividadMantenimientoId(UUID actividadMantenimientoId);

    boolean existsByActividadMantenimientoIdAndTipoActivoIdAndComponenteId(UUID actividadMantenimientoId, UUID tipoActivoId, UUID componenteId);
}
