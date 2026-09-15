package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoAdjuntoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoAdjuntoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.OrdenTrabajoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringOrdenTrabajoAdjuntoRepository;
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
public class OrdenTrabajoAdjuntoRepositoryAdapter implements OrdenTrabajoAdjuntoRepository {

    private final SpringOrdenTrabajoAdjuntoRepository springRepository;
    private final OrdenTrabajoPersistenceMapper mapper;

    @Override
    public Optional<OrdenTrabajoAdjunto> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toAdjuntoDomain);
    }

    @Override
    public Page<OrdenTrabajoAdjunto> findByOrdenTrabajoId(UUID ordenTrabajoId, Pageable pageable) {
        return springRepository.findByOrdenTrabajoId(ordenTrabajoId, pageable).map(mapper::toAdjuntoDomain);
    }

    @Override
    public List<OrdenTrabajoAdjunto> findByOrdenTrabajoId(UUID ordenTrabajoId) {
        return springRepository.findByOrdenTrabajoId(ordenTrabajoId).stream()
                .map(mapper::toAdjuntoDomain)
                .collect(Collectors.toList());
    }

    @Override
    public OrdenTrabajoAdjunto save(OrdenTrabajoAdjunto adjunto) {
        OrdenTrabajoAdjuntoEntity entity = mapper.toAdjuntoEntity(adjunto);
        OrdenTrabajoAdjuntoEntity saved = springRepository.save(entity);
        return mapper.toAdjuntoDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }
}
