package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.Prioridad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PrioridadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.PrioridadEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.PrioridadPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.specification.SpringPrioridadRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class PrioridadRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Prioridad,
        PrioridadEntity,
        UUID
        >
        implements PrioridadRepository {

    private final SpringPrioridadRepository springRepository;

    private final PrioridadPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            PrioridadEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected PrioridadEntity toEntity(
            Prioridad domain
    ) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Prioridad toDomain(
            PrioridadEntity entity
    ) {
        return mapper.toDomain(entity);
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
    public Page<Prioridad> search(
            String query,
            Pageable pageable
    ) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}