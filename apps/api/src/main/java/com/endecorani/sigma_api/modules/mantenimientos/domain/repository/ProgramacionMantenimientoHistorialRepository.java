package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoHistorial;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProgramacionMantenimientoHistorialRepository {

    Optional<ProgramacionMantenimientoHistorial> findById(UUID id);

    List<ProgramacionMantenimientoHistorial> findByProgramacionMantenimientoId(UUID programacionMantenimientoId);

    Optional<ProgramacionMantenimientoHistorial> findFirstPendingByProgramacionMantenimientoId(UUID programacionMantenimientoId);

    Optional<ProgramacionMantenimientoHistorial> findBySolicitudMantenimientoId(UUID solicitudMantenimientoId);

    ProgramacionMantenimientoHistorial save(ProgramacionMantenimientoHistorial item);
}
