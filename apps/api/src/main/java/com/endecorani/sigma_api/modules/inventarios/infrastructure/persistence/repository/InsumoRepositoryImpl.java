package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.inventarios.domain.model.Insumo;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.InsumoRepository;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.InsumoEntity;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.mapper.InsumoPersistenceMapper;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.specification.SpringInsumoRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class InsumoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Insumo,
        InsumoEntity,
        UUID
        >
        implements InsumoRepository {

    private final SpringInsumoRepository springRepository;

    private final InsumoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            InsumoEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected InsumoEntity toEntity(Insumo domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Insumo toDomain(InsumoEntity entity) {
        return mapper.toDomain(entity);
    }
}
