package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ChecklistItemRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistItemEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ChecklistItemPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.specification.SpringChecklistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ChecklistItemRepositoryImpl
        implements ChecklistItemRepository {

    private final SpringChecklistItemRepository springRepository;
    private final ChecklistItemPersistenceMapper mapper;

    @Override
    public ChecklistItem save(ChecklistItem domain) {
        ChecklistItemEntity entity = mapper.toEntity(domain);
        return mapper.toDomain(springRepository.save(entity));
    }

    @Override
    public Optional<ChecklistItem> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<ChecklistItem> findAll() {
        return springRepository
                .findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<ChecklistItem> findAll(Pageable pageable) {
        return springRepository
                .findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<ChecklistItem> findByChecklistMantenimientoId(
            UUID checklistMantenimientoId,
            Pageable pageable
    ) {
        return springRepository
                .findByChecklistMantenimientoId(
                        checklistMantenimientoId,
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
    public boolean
    existsByChecklistMantenimientoIdAndCodigoIgnoreCase(
            UUID checklistMantenimientoId,
            String codigo
    ) {
        return springRepository
                .existsByChecklistMantenimientoIdAndCodigoIgnoreCase(
                        checklistMantenimientoId,
                        codigo
                );
    }

    @Override
    public boolean
    existsByChecklistMantenimientoIdAndCodigoIgnoreCaseAndIdNot(
            UUID checklistMantenimientoId,
            String codigo,
            UUID id
    ) {
        return springRepository
                .existsByChecklistMantenimientoIdAndCodigoIgnoreCaseAndIdNot(
                        checklistMantenimientoId,
                        codigo,
                        id
                );
    }

    @Override
    public Page<ChecklistItem> search(
            String query,
            Pageable pageable
    ) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<ChecklistItem> searchByChecklistMantenimientoId(
            UUID checklistMantenimientoId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByChecklistMantenimientoId(
                        checklistMantenimientoId,
                        query,
                        pageable
                )
                .map(mapper::toDomain);
    }
}
