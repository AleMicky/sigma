package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.PlanMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PlanMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PlanMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.PlanMantenimientoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringPlanMantenimientoRepository;
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
public class PlanMantenimientoRepositoryAdapter implements PlanMantenimientoRepository {

    private final SpringPlanMantenimientoRepository springRepository;
    private final PlanMantenimientoPersistenceMapper mapper;

    @Override
    public Page<PlanMantenimiento> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<PlanMantenimiento> search(String search, Pageable pageable) {
        return springRepository.search(search, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<PlanMantenimiento> findByTipoActivoId(UUID tipoActivoId, Pageable pageable) {
        return springRepository.findByTipoActivoId(tipoActivoId, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<PlanMantenimiento> searchByTipoActivoId(UUID tipoActivoId, String search, Pageable pageable) {
        return springRepository.searchByTipoActivoId(tipoActivoId, search, pageable).map(mapper::toDomain);
    }

    @Override
    public List<PlanMantenimiento> findByTipoActivoId(UUID tipoActivoId) {
        return springRepository.findByTipoActivoId(tipoActivoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<PlanMantenimiento> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<PlanMantenimiento> findByCodigo(String codigo) {
        return springRepository.findByCodigoIgnoreCase(codigo).map(mapper::toDomain);
    }

    @Override
    public PlanMantenimiento save(PlanMantenimiento plan) {
        PlanMantenimientoEntity entity = mapper.toEntity(plan);
        PlanMantenimientoEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(String codigo) {
        return springRepository.existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id) {
        return springRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }
}
