package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.SolicitudMantenimientoTrazabilidad;

import java.util.List;
import java.util.UUID;

public interface SolicitudMantenimientoTrazabilidadRepository {
    SolicitudMantenimientoTrazabilidad save(SolicitudMantenimientoTrazabilidad trazabilidad);

    List<SolicitudMantenimientoTrazabilidad> findBySolicitudMantenimientoId(UUID solicitudMantenimientoId);
}
