package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ActividadMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ActividadMantenimientoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringActividadMantenimientoRepository;
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
public class ActividadMantenimientoRepositoryAdapter implements ActividadMantenimientoRepository {

    private final SpringActividadMantenimientoRepository springRepository;
    private final ActividadMantenimientoPersistenceMapper mapper;

    @Override
    public Page<ActividadMantenimiento> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<ActividadMantenimiento> search(String search, Pageable pageable) {
        return springRepository.search(search, pageable).map(mapper::toDomain);
    }

    @Override
    public Optional<ActividadMantenimiento> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<ActividadMantenimiento> findByCodigo(String codigo) {
        return springRepository.findByCodigoIgnoreCase(codigo).map(mapper::toDomain);
    }

    @Override
    public List<ActividadMantenimiento> findByTipoActivoId(UUID tipoActivoId) {
        return springRepository.findByTipoActivoId(tipoActivoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public ActividadMantenimiento save(ActividadMantenimiento actividad) {
        ActividadMantenimientoEntity entity = mapper.toEntity(actividad);
        ActividadMantenimientoEntity saved = springRepository.save(entity);
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
