package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ChecklistMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ChecklistMantenimientoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringChecklistMantenimientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ChecklistMantenimientoRepositoryImpl
        implements ChecklistMantenimientoRepository {

    private final SpringChecklistMantenimientoRepository springRepository;
    private final ChecklistMantenimientoPersistenceMapper mapper;

    @Override
    public ChecklistMantenimiento save(ChecklistMantenimiento domain) {
        ChecklistMantenimientoEntity entity = mapper.toEntity(domain);
        return mapper.toDomain(springRepository.save(entity));
    }

    @Override
    public Optional<ChecklistMantenimiento> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<ChecklistMantenimiento> findAll() {
        return springRepository
                .findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<ChecklistMantenimiento> findAll(Pageable pageable) {
        return springRepository
                .findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<ChecklistMantenimiento>
    findByActividadMantenimientoId(
            UUID actividadMantenimientoId,
            Pageable pageable
    ) {
        return springRepository
                .findByActividadMantenimientoId(
                        actividadMantenimientoId,
                        pageable
                )
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsById(UUID id) {
        return springRepository.existsById(id);
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
    public boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    ) {
        return springRepository
                .existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }

    @Override
    public boolean
    existsByActividadMantenimientoIdAndCodigoIgnoreCase(
            UUID actividadMantenimientoId,
            String codigo
    ) {
        return springRepository
                .existsByActividadMantenimientoIdAndCodigoIgnoreCase(
                        actividadMantenimientoId,
                        codigo
                );
    }

    @Override
    public boolean
    existsByActividadMantenimientoIdAndCodigoIgnoreCaseAndIdNot(
            UUID actividadMantenimientoId,
            String codigo,
            UUID id
    ) {
        return springRepository
                .existsByActividadMantenimientoIdAndCodigoIgnoreCaseAndIdNot(
                        actividadMantenimientoId,
                        codigo,
                        id
                );
    }

    @Override
    public Page<ChecklistMantenimiento> search(
            String query,
            Pageable pageable
    ) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<ChecklistMantenimiento>
    searchByActividadMantenimientoId(
            UUID actividadMantenimientoId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByActividadMantenimientoId(
                        actividadMantenimientoId,
                        query,
                        pageable
                )
                .map(mapper::toDomain);
    }
}
