package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ChecklistItem;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ChecklistItemRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ChecklistItemEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ActividadMantenimientoPersistenceMapper;
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
    private final ActividadMantenimientoPersistenceMapper mapper;

    @Override
    public Optional<ChecklistItem> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toChecklistItemDomain);
    }

    @Override
    public Page<ChecklistItem> findAll(Pageable pageable) {
        return springRepository.findAll(pageable).map(mapper::toChecklistItemDomain);
    }

    @Override
    public Page<ChecklistItem> findByActividadMantenimientoId(UUID actividadMantenimientoId, Pageable pageable) {
        return springRepository.findByActividadMantenimientoId(actividadMantenimientoId, pageable).map(mapper::toChecklistItemDomain);
    }

    @Override
    public List<ChecklistItem> findByActividadMantenimientoId(UUID actividadMantenimientoId) {
        return springRepository.findByActividadMantenimientoIdOrderByOrdenAsc(actividadMantenimientoId).stream()
                .map(mapper::toChecklistItemDomain)
                .collect(Collectors.toList());
    }

    @Override
    public ChecklistItem save(ChecklistItem item) {
        ChecklistItemEntity entity = mapper.toChecklistItemEntity(item);
        ChecklistItemEntity saved = springRepository.save(entity);
        return mapper.toChecklistItemDomain(saved);
    }

    @Override
    public List<ChecklistItem> saveAll(List<ChecklistItem> items) {
        List<ChecklistItemEntity> entities = items.stream()
                .map(mapper::toChecklistItemEntity)
                .collect(Collectors.toList());
        return springRepository.saveAll(entities).stream()
                .map(mapper::toChecklistItemDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public void deleteByActividadMantenimientoId(UUID actividadMantenimientoId) {
        springRepository.deleteByActividadMantenimientoId(actividadMantenimientoId);
    }
}
