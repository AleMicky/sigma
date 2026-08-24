package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoAdjunto;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoAdjuntoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.OrdenTrabajoAdjuntoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.OrdenTrabajoAdjuntoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringOrdenTrabajoAdjuntoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class OrdenTrabajoAdjuntoRepositoryImpl
        implements OrdenTrabajoAdjuntoRepository {

    private final SpringOrdenTrabajoAdjuntoRepository springRepository;
    private final OrdenTrabajoAdjuntoPersistenceMapper mapper;

    @Override
    public OrdenTrabajoAdjunto save(OrdenTrabajoAdjunto domain) {
        OrdenTrabajoAdjuntoEntity entity = mapper.toEntity(domain);
        OrdenTrabajoAdjuntoEntity saved = springRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<OrdenTrabajoAdjunto> findById(UUID id) {
        return springRepository
                .findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public Page<OrdenTrabajoAdjunto> findByOrdenTrabajoId(
            UUID ordenTrabajoId,
            Pageable pageable
    ) {
        return springRepository
                .findByOrdenTrabajoId(ordenTrabajoId, pageable)
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
}
