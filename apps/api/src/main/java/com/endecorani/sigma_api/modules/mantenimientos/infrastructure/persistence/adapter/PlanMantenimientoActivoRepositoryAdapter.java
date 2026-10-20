package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PlanMantenimientoActivoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.PlanMantenimientoActivoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringPlanMantenimientoActivoRepository;
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
public class PlanMantenimientoActivoRepositoryAdapter implements PlanMantenimientoActivoRepository {

    private final SpringPlanMantenimientoActivoRepository springRepository;
    private final PlanMantenimientoActivoPersistenceMapper mapper;

    @Override
    public Page<PlanMantenimientoActivo> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Optional<PlanMantenimientoActivo> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<PlanMantenimientoActivo> findByPlanMantenimientoId(UUID planMantenimientoId) {
        return springRepository.findByPlanMantenimientoIdOrderByFechaInicioDesc(planMantenimientoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanMantenimientoActivo> findByPlanMantenimientoIdAndActivo(UUID planMantenimientoId, Boolean activo) {
        return springRepository.findByPlanMantenimientoIdAndEstadoActivoOrderByFechaInicioDesc(planMantenimientoId, activo).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<PlanMantenimientoActivo> findByActivoId(UUID activoId) {
        return springRepository.findByActivoIdOrderByFechaInicioDesc(activoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Page<PlanMantenimientoActivo> findByPlanMantenimientoId(UUID planMantenimientoId, Pageable pageable) {
        return springRepository.findByPlanMantenimientoId(planMantenimientoId, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<PlanMantenimientoActivo> findByActivoId(UUID activoId, Pageable pageable) {
        return springRepository.findByActivoId(activoId, pageable).map(mapper::toDomain);
    }

    @Override
    public PlanMantenimientoActivo save(PlanMantenimientoActivo item) {
        PlanMantenimientoActivoEntity entity = mapper.toEntity(item);
        PlanMantenimientoActivoEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByPlanMantenimientoIdAndActivoIdAndActivoTrue(UUID planMantenimientoId, UUID activoId) {
        return springRepository.existsByPlanMantenimientoIdAndActivoIdAndEstadoActivoTrue(planMantenimientoId, activoId);
    }

    @Override
    public boolean existsByPlanMantenimientoIdAndActivoIdAndActivoTrueAndIdNot(UUID planMantenimientoId, UUID activoId, UUID id) {
        return springRepository.existsByPlanMantenimientoIdAndActivoIdAndEstadoActivoTrueAndIdNot(planMantenimientoId, activoId, id);
    }

    @Override
    public long countByPlanMantenimientoId(UUID planMantenimientoId) {
        return springRepository.countByPlanMantenimientoId(planMantenimientoId);
    }
}
