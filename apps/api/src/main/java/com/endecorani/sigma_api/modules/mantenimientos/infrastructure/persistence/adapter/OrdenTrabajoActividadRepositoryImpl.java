package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoActividadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoActividadEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.OrdenTrabajoActividadPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringOrdenTrabajoActividadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class OrdenTrabajoActividadRepositoryImpl
        implements OrdenTrabajoActividadRepository {

    private final SpringOrdenTrabajoActividadRepository springRepository;
    private final OrdenTrabajoActividadPersistenceMapper mapper;

    @Override
    public OrdenTrabajoActividad save(OrdenTrabajoActividad domain) {
        OrdenTrabajoActividadEntity entity = mapper.toEntity(domain);
        OrdenTrabajoActividadEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<OrdenTrabajoActividad> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<OrdenTrabajoActividad> findAll() {
        return springRepository
                .findAll()
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Page<OrdenTrabajoActividad> findAll(Pageable pageable) {
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
    public Page<OrdenTrabajoActividad> findByOrdenTrabajoId(
            UUID ordenTrabajoId,
            Pageable pageable
    ) {
        return springRepository
                .findByOrdenTrabajoId(ordenTrabajoId, pageable)
                .map(mapper::toDomain);
    }
}
