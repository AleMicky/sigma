package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.inventarios.domain.model.TipoInsumo;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.TipoInsumoRepository;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.TipoInsumoEntity;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.mapper.TipoInsumoPersistenceMapper;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.specification.SpringTipoInsumoRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class TipoInsumoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        TipoInsumo,
        TipoInsumoEntity,
        UUID
        >
        implements TipoInsumoRepository {

    private final SpringTipoInsumoRepository springRepository;

    private final TipoInsumoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            TipoInsumoEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected TipoInsumoEntity toEntity(
            TipoInsumo domain
    ) {
        return mapper.toEntity(domain);
    }

    @Override
    protected TipoInsumo toDomain(
            TipoInsumoEntity entity
    ) {
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
    public Page<TipoInsumo> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}
