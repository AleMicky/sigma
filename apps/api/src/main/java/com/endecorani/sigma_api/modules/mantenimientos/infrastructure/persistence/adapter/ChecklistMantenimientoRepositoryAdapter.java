package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ChecklistMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ChecklistPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringChecklistMantenimientoRepository;
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
public class ChecklistMantenimientoRepositoryAdapter implements ChecklistMantenimientoRepository {

    private final SpringChecklistMantenimientoRepository springRepository;
    private final ChecklistPersistenceMapper mapper;

    @Override
    public Page<ChecklistMantenimiento> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toDomain);
    }

    @Override
    public Page<ChecklistMantenimiento> search(String search, Pageable pageable) {
        return springRepository.search(search, pageable).map(mapper::toDomain);
    }

    @Override
    public Optional<ChecklistMantenimiento> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Optional<ChecklistMantenimiento> findByCodigo(String codigo) {
        return springRepository.findByCodigoIgnoreCase(codigo).map(mapper::toDomain);
    }

    @Override
    public List<ChecklistMantenimiento> findByActividadMantenimientoId(UUID actividadMantenimientoId) {
        return springRepository.findByActividadMantenimientoId(actividadMantenimientoId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ChecklistMantenimiento> findByActividadMantenimientoId(UUID actividadMantenimientoId, Pageable pageable) {
        return springRepository.findByActividadMantenimientoId(actividadMantenimientoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public ChecklistMantenimiento save(ChecklistMantenimiento checklist) {
        ChecklistMantenimientoEntity entity = mapper.toEntity(checklist);
        ChecklistMantenimientoEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsById(UUID id) {
        return springRepository.existsById(id);
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
