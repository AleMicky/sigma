package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.enums.TipoCriterioMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimientoCriterio;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoCriterioRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ProgramacionMantenimientoCriterioEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ProgramacionMantenimientoCriterioPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringProgramacionMantenimientoCriterioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ProgramacionMantenimientoCriterioRepositoryAdapter implements ProgramacionMantenimientoCriterioRepository {

    private final SpringProgramacionMantenimientoCriterioRepository springRepository;
    private final ProgramacionMantenimientoCriterioPersistenceMapper mapper;

    @Override
    public Optional<ProgramacionMantenimientoCriterio> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<ProgramacionMantenimientoCriterio> findByProgramacionMantenimientoId(UUID programacionMantenimientoId) {
        return springRepository.findByProgramacionMantenimientoId(programacionMantenimientoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProgramacionMantenimientoCriterio> findByProgramacionMantenimientoIdAndActivoTrue(UUID programacionMantenimientoId) {
        return springRepository.findByProgramacionMantenimientoIdAndActivoTrue(programacionMantenimientoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ProgramacionMantenimientoCriterio> findByProgramacionMantenimientoIdAndTipoCriterio(
            UUID programacionMantenimientoId,
            TipoCriterioMantenimiento tipoCriterio
    ) {
        return springRepository.findByProgramacionMantenimientoIdAndTipoCriterio(programacionMantenimientoId, tipoCriterio)
                .map(mapper::toDomain);
    }

    @Override
    public ProgramacionMantenimientoCriterio save(ProgramacionMantenimientoCriterio item) {
        ProgramacionMantenimientoCriterioEntity entity = mapper.toEntity(item);
        ProgramacionMantenimientoCriterioEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByProgramacionMantenimientoIdAndTipoCriterio(
            UUID programacionMantenimientoId,
            TipoCriterioMantenimiento tipoCriterio
    ) {
        return springRepository.existsByProgramacionMantenimientoIdAndTipoCriterio(programacionMantenimientoId, tipoCriterio);
    }

    @Override
    public boolean existsByProgramacionMantenimientoIdAndTipoCriterioAndIdNot(
            UUID programacionMantenimientoId,
            TipoCriterioMantenimiento tipoCriterio,
            UUID id
    ) {
        return springRepository.existsByProgramacionMantenimientoIdAndTipoCriterioAndIdNot(programacionMantenimientoId, tipoCriterio, id);
    }

    @Override
    public long countByProgramacionMantenimientoIdAndActivoTrue(UUID programacionMantenimientoId) {
        return springRepository.countByProgramacionMantenimientoIdAndActivoTrue(programacionMantenimientoId);
    }
}
