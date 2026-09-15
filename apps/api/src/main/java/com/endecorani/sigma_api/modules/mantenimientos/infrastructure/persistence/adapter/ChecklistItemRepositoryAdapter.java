package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ChecklistItemRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistItemEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ChecklistPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringChecklistItemRepository;
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
public class ChecklistItemRepositoryAdapter implements ChecklistItemRepository {

    private final SpringChecklistItemRepository springRepository;
    private final ChecklistPersistenceMapper mapper;

    @Override
    public Page<ChecklistItem> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toItemDomain);
    }

    @Override
    public Page<ChecklistItem> findByChecklistMantenimientoId(UUID checklistMantenimientoId, Pageable pageable) {
        return springRepository.findByChecklistMantenimientoId(checklistMantenimientoId, pageable)
                .map(mapper::toItemDomain);
    }

    @Override
    public List<ChecklistItem> findByChecklistMantenimientoIdOrderByOrdenAsc(UUID checklistMantenimientoId) {
        return springRepository.findByChecklistMantenimientoIdOrderByOrdenAsc(checklistMantenimientoId).stream()
                .map(mapper::toItemDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ChecklistItem> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toItemDomain);
    }

    @Override
    public Optional<ChecklistItem> findByChecklistMantenimientoIdAndCodigo(UUID checklistMantenimientoId, String codigo) {
        return springRepository.findByChecklistMantenimientoIdAndCodigoIgnoreCase(checklistMantenimientoId, codigo)
                .map(mapper::toItemDomain);
    }

    @Override
    public ChecklistItem save(ChecklistItem item) {
        ChecklistItemEntity entity = mapper.toItemEntity(item);
        ChecklistItemEntity saved = springRepository.save(entity);
        return mapper.toItemDomain(saved);
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
    public boolean existsByChecklistMantenimientoIdAndCodigoIgnoreCase(UUID checklistMantenimientoId, String codigo) {
        return springRepository.existsByChecklistMantenimientoIdAndCodigoIgnoreCase(checklistMantenimientoId, codigo);
    }

    @Override
    public boolean existsByChecklistMantenimientoIdAndCodigoIgnoreCaseAndIdNot(UUID checklistMantenimientoId, String codigo, UUID id) {
        return springRepository.existsByChecklistMantenimientoIdAndCodigoIgnoreCaseAndIdNot(checklistMantenimientoId, codigo, id);
    }
}
