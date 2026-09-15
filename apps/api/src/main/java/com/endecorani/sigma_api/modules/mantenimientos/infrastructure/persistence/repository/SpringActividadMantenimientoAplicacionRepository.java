package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ActividadMantenimientoAplicacionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringActividadMantenimientoAplicacionRepository extends JpaRepository<ActividadMantenimientoAplicacionEntity, UUID> {

    Page<ActividadMantenimientoAplicacionEntity> findByActividadMantenimientoId(UUID actividadMantenimientoId, Pageable pageable);

    List<ActividadMantenimientoAplicacionEntity> findByActividadMantenimientoId(UUID actividadMantenimientoId);

    List<ActividadMantenimientoAplicacionEntity> findByTipoActivoId(UUID tipoActivoId);

    boolean existsByActividadMantenimientoIdAndTipoActivoIdAndComponenteId(UUID actividadMantenimientoId, UUID tipoActivoId, UUID componenteId);
}
