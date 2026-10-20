package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ProgramacionMantenimientoHistorialEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringProgramacionMantenimientoHistorialRepository
        extends JpaRepository<ProgramacionMantenimientoHistorialEntity, UUID> {

    List<ProgramacionMantenimientoHistorialEntity> findByProgramacionMantenimientoIdOrderByFechaDisparoDesc(
            UUID programacionMantenimientoId
    );

    Optional<ProgramacionMantenimientoHistorialEntity> findFirstByProgramacionMantenimientoIdAndCompletadoFalseOrderByFechaDisparoDesc(
            UUID programacionMantenimientoId
    );

    Optional<ProgramacionMantenimientoHistorialEntity> findBySolicitudMantenimientoId(
            UUID solicitudMantenimientoId
    );
}
