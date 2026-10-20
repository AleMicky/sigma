package com.endecorani.sigma_api.modules.mantenimientos.domain.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProgramacionMantenimientoCriterioRepository {

    Optional<ProgramacionMantenimientoCriterio> findById(UUID id);

    List<ProgramacionMantenimientoCriterio> findByProgramacionMantenimientoId(UUID programacionMantenimientoId);

    List<ProgramacionMantenimientoCriterio> findByProgramacionMantenimientoIdAndActivoTrue(UUID programacionMantenimientoId);

    Optional<ProgramacionMantenimientoCriterio> findByProgramacionMantenimientoIdAndTipoCriterio(
            UUID programacionMantenimientoId,
            TipoCriterioMantenimiento tipoCriterio
    );

    ProgramacionMantenimientoCriterio save(ProgramacionMantenimientoCriterio item);

    void deleteById(UUID id);

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
