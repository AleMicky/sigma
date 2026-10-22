package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ProgramacionMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ProgramacionMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ProgramacionMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ProgramacionMantenimientoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringProgramacionMantenimientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class ProgramacionMantenimientoRepositoryAdapter implements ProgramacionMantenimientoRepository {

    private final SpringProgramacionMantenimientoRepository springRepository;
    private final ProgramacionMantenimientoPersistenceMapper mapper;

    @Override
    public Page<ProgramacionMantenimiento> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Optional<ProgramacionMantenimiento> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<ProgramacionMantenimiento> findByIdWithLock(UUID id) {
        return springRepository.findByIdWithLock(id).map(mapper::toDomain);
    }

    @Override
    public List<ProgramacionMantenimiento> findByPlanMantenimientoActivoId(UUID planMantenimientoActivoId) {
        return springRepository.findByPlanMantenimientoActivoId(planMantenimientoActivoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProgramacionMantenimiento> findByActivoTrue() {
        return springRepository.findByActivoTrue().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ProgramacionMantenimiento> findByPlanMantenimientoActivoIdAndActivoTrue(UUID planMantenimientoActivoId) {
        return springRepository.findByPlanMantenimientoActivoIdAndActivoTrue(planMantenimientoActivoId)
                .map(mapper::toDomain);
    }

    @Override
    public Page<ProgramacionMantenimiento> findByPlanMantenimientoActivoId(UUID planMantenimientoActivoId, Pageable pageable) {
        return springRepository.findByPlanMantenimientoActivoId(planMantenimientoActivoId, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<ProgramacionMantenimiento> search(UUID planMantenimientoActivoId, UUID activoId, Boolean activo, String q, Pageable pageable) {
        return springRepository.search(planMantenimientoActivoId, activoId, activo, q, pageable).map(mapper::toDomain);
    }

    @Override
    public ProgramacionMantenimiento save(ProgramacionMantenimiento item) {
        ProgramacionMantenimientoEntity entity = mapper.toEntity(item);
        ProgramacionMantenimientoEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByPlanMantenimientoActivoIdAndActivoTrue(UUID planMantenimientoActivoId) {
        return springRepository.existsByPlanMantenimientoActivoIdAndActivoTrue(planMantenimientoActivoId);
    }

    @Override
    public boolean existsByPlanMantenimientoActivoIdAndActivoTrueAndIdNot(UUID planMantenimientoActivoId, UUID id) {
        return springRepository.existsByPlanMantenimientoActivoIdAndActivoTrueAndIdNot(planMantenimientoActivoId, id);
    }
}
