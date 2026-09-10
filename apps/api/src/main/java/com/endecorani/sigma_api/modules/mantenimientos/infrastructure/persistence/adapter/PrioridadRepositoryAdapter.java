package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;


import com.endecorani.sigma_api.modules.mantenimientos.domain.model.Prioridad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PrioridadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PrioridadEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.PrioridadPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringPrioridadRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@AllArgsConstructor
public class PrioridadRepositoryAdapter implements PrioridadRepository {

    private final SpringPrioridadRepository springRepository;

    private final PrioridadPersistenceMapper mapper;

    @Override
    public Page<Prioridad> findAll(
            Pageable pageable
    ) {
        return springRepository.findAll(pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Prioridad> search(
            String search,
            Pageable pageable
    ) {
        return springRepository.search(search, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Optional<Prioridad> findById(UUID id) {
        return springRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Prioridad save(Prioridad prioridad) {
        PrioridadEntity entity = mapper.toEntity(prioridad);
        PrioridadEntity saved = springRepository.save(entity);

        return mapper.toDomain(saved);
    }

    @Override
    public void deleteById(UUID id) {
        springRepository.deleteById(id);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(
            String codigo
    ) {
        return springRepository
                .existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    ) {
        return springRepository
                .existsByCodigoIgnoreCaseAndIdNot(
                        codigo,
                        id
                );
    }

    @Override
    public boolean existsByPorDefectoTrue() {
        return springRepository.existsByPorDefectoTrue();
    }

    @Override
    public boolean existsByPorDefectoTrueAndIdNot(UUID id) {
        return springRepository.existsByPorDefectoTrueAndIdNot(id);
    }

}