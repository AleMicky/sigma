package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.OrdenTrabajoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringOrdenTrabajoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class OrdenTrabajoRepositoryImpl implements OrdenTrabajoRepository {

    private final SpringOrdenTrabajoRepository springRepository;
    private final OrdenTrabajoPersistenceMapper mapper;

    @Override
    public OrdenTrabajo save(OrdenTrabajo domain) {
        OrdenTrabajoEntity entity = mapper.toEntity(domain);
        OrdenTrabajoEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<OrdenTrabajo> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<OrdenTrabajo> findAll() {
        return springRepository
                .findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<OrdenTrabajo> findAll(Pageable pageable) {
        return springRepository
                .findAll(pageable)
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
    public boolean existsBySolicitudMantenimientoId(UUID solicitudMantenimientoId) {
        return springRepository.existsBySolicitudMantenimientoId(solicitudMantenimientoId);
    }

    @Override
    public boolean existsBySolicitudMantenimientoIdAndIdNot(
            UUID solicitudMantenimientoId,
            UUID id
    ) {
        return springRepository
                .existsBySolicitudMantenimientoIdAndIdNot(solicitudMantenimientoId, id);
    }

    @Override
    public Page<OrdenTrabajo> search(
            String query,
            Pageable pageable
    ) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}
