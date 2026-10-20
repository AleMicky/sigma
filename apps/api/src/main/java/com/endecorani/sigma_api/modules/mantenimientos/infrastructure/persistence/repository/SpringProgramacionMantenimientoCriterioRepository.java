package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ProgramacionMantenimientoCriterioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringProgramacionMantenimientoCriterioRepository
        extends JpaRepository<ProgramacionMantenimientoCriterioEntity, UUID> {

    List<ProgramacionMantenimientoCriterioEntity> findByProgramacionMantenimientoId(UUID programacionMantenimientoId);

    List<ProgramacionMantenimientoCriterioEntity> findByProgramacionMantenimientoIdAndActivoTrue(UUID programacionMantenimientoId);

    Optional<ProgramacionMantenimientoCriterioEntity> findByProgramacionMantenimientoIdAndTipoCriterio(
            UUID programacionMantenimientoId,
            TipoCriterioMantenimiento tipoCriterio
    );

    boolean existsByProgramacionMantenimientoIdAndTipoCriterio(
            UUID programacionMantenimientoId,
            TipoCriterioMantenimiento tipoCriterio
    );

    boolean existsByProgramacionMantenimientoIdAndTipoCriterioAndIdNot(
            UUID programacionMantenimientoId,
            TipoCriterioMantenimiento tipoCriterio,
            UUID id
    );

    long countByProgramacionMantenimientoIdAndActivoTrue(UUID programacionMantenimientoId);
}
