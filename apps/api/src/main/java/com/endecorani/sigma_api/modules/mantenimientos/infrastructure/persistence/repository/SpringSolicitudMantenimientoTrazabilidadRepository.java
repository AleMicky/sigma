package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.SolicitudMantenimientoTrazabilidadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringSolicitudMantenimientoTrazabilidadRepository
        extends JpaRepository<SolicitudMantenimientoTrazabilidadEntity, UUID> {

    List<SolicitudMantenimientoTrazabilidadEntity> findBySolicitudMantenimientoIdOrderByFechaAsc(UUID solicitudMantenimientoId);
}
