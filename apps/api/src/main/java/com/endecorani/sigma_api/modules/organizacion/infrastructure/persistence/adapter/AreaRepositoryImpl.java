package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Area;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.AreaRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.AreaEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper.AreaPersistenceMapper;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class AreaRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Area,
        AreaEntity,
        UUID
        >
        implements AreaRepository {

    private final SpringAreaRepository springRepository;

    private final AreaPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            AreaEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected AreaEntity toEntity(Area domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Area toDomain(AreaEntity entity) {
        return mapper.toDomain(entity);
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
        return springRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }

    @Override
    public Page<Area> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}