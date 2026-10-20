package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimientoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoActividadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PlanMantenimientoActividadEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.PlanMantenimientoActividadPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringPlanMantenimientoActividadRepository;
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
public class PlanMantenimientoActividadRepositoryAdapter implements PlanMantenimientoActividadRepository {

    private final SpringPlanMantenimientoActividadRepository springRepository;
    private final PlanMantenimientoActividadPersistenceMapper mapper;

    @Override
    public List<PlanMantenimientoActividad> findByPlanMantenimientoId(UUID planMantenimientoId) {
        return springRepository.findByPlanMantenimientoIdOrderByOrdenAsc(planMantenimientoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Page<PlanMantenimientoActividad> findByPlanMantenimientoId(UUID planMantenimientoId, Pageable pageable) {
        return springRepository.findByPlanMantenimientoId(planMantenimientoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<PlanMantenimientoActividad> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public long countByPlanMantenimientoId(UUID planMantenimientoId) {
        return springRepository.countByPlanMantenimientoId(planMantenimientoId);
    }

    @Override
    public PlanMantenimientoActividad save(PlanMantenimientoActividad actividad) {
        PlanMantenimientoActividadEntity entity = mapper.toEntity(actividad);
        PlanMantenimientoActividadEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByPlanMantenimientoIdAndActividadMantenimientoAplicacionId(
            UUID planMantenimientoId,
            UUID actividadMantenimientoAplicacionId
    ) {
        return springRepository.existsByPlanMantenimientoIdAndActividadMantenimientoAplicacionId(
                planMantenimientoId,
                actividadMantenimientoAplicacionId
        );
    }

    @Override
    public boolean existsByPlanMantenimientoIdAndActividadMantenimientoAplicacionIdAndIdNot(
            UUID planMantenimientoId,
            UUID actividadMantenimientoAplicacionId,
            UUID id
    ) {
        return springRepository.existsByPlanMantenimientoIdAndActividadMantenimientoAplicacionIdAndIdNot(
                planMantenimientoId,
                actividadMantenimientoAplicacionId,
                id
        );
    }
}
