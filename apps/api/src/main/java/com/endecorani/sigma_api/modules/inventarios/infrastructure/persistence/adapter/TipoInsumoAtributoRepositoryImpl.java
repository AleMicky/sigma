package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.inventarios.domain.model.TipoInsumoAtributo;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.TipoInsumoAtributoRepository;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.TipoInsumoAtributoEntity;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.mapper.TipoInsumoAtributoPersistenceMapper;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.specification.SpringTipoInsumoAtributoRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class TipoInsumoAtributoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        TipoInsumoAtributo,
        TipoInsumoAtributoEntity,
        UUID
        >
        implements TipoInsumoAtributoRepository {

    private final SpringTipoInsumoAtributoRepository springRepository;

    private final TipoInsumoAtributoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            TipoInsumoAtributoEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected TipoInsumoAtributoEntity toEntity(
            TipoInsumoAtributo domain
    ) {
        return mapper.toEntity(domain);
    }

    @Override
    protected TipoInsumoAtributo toDomain(
            TipoInsumoAtributoEntity entity
    ) {
        return mapper.toDomain(entity);
    }

    @Override
    public Page<TipoInsumoAtributo> findByTipoInsumoId(
            UUID tipoInsumoId,
            Pageable pageable
    ) {
        return springRepository
                .findByTipoInsumoId(tipoInsumoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<TipoInsumoAtributo> searchByTipoInsumoId(
            UUID tipoInsumoId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByTipoInsumoId(tipoInsumoId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsByTipoInsumoIdAndCodigoIgnoreCase(
            UUID tipoInsumoId,
            String codigo
    ) {
        return springRepository.existsByTipoInsumoIdAndCodigoIgnoreCase(
                tipoInsumoId,
                codigo
        );
    }

    @Override
    public boolean existsByTipoInsumoIdAndCodigoIgnoreCaseAndIdNot(
            UUID tipoInsumoId,
            String codigo,
            UUID id
    ) {
        return springRepository.existsByTipoInsumoIdAndCodigoIgnoreCaseAndIdNot(
                tipoInsumoId,
                codigo,
                id
        );
    }

    @Override
    public Integer findMaxOrdenByTipoInsumoId(UUID tipoInsumoId) {
        return springRepository.findMaxOrdenByTipoInsumoId(tipoInsumoId);
    }

    @Override
    public boolean existsByTipoInsumoIdAndOrden(
            UUID tipoInsumoId,
            Integer orden
    ) {
        return springRepository.existsByTipoInsumoIdAndOrden(
                tipoInsumoId,
                orden
        );
    }

    @Override
    public boolean existsByTipoInsumoIdAndOrdenAndIdNot(
            UUID tipoInsumoId,
            Integer orden,
            UUID id
    ) {
        return springRepository.existsByTipoInsumoIdAndOrdenAndIdNot(
                tipoInsumoId,
                orden,
                id
        );
    }
}
