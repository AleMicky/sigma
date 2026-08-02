package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.parametros.domain.model.CatalogoItem;
import com.endecorani.sigma_api.modules.parametros.domain.repository.CatalogoItemRepository;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.CatalogoItemEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper.CatalogoItemPersistenceMapper;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CatalogoItemRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        CatalogoItem,
        CatalogoItemEntity,
        UUID
        >
        implements CatalogoItemRepository {

    private final SpringCatalogoItemRepository springRepository;

    private final CatalogoItemPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            CatalogoItemEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected CatalogoItemEntity toEntity(CatalogoItem domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected CatalogoItem toDomain(CatalogoItemEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public Page<CatalogoItem> findByCatalogoId(
            UUID catalogoId,
            Pageable pageable
    ) {
        return springRepository
                .findByCatalogo_Id(catalogoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsByCatalogoIdAndValorIgnoreCase(
            UUID catalogoId,
            String valor
    ) {
        return springRepository.existsByCatalogo_IdAndValorIgnoreCase(
                catalogoId,
                valor
        );
    }

    @Override
    public boolean existsByCatalogoIdAndValorIgnoreCaseAndIdNot(
            UUID catalogoId,
            String valor,
            UUID id
    ) {
        return springRepository.existsByCatalogo_IdAndValorIgnoreCaseAndIdNot(
                catalogoId,
                valor,
                id
        );
    }

    @Override
    public Integer findMaxOrdenByCatalogoId(UUID catalogoId) {
        return springRepository.findMaxOrdenByCatalogoId(catalogoId);
    }

    @Override
    public boolean existsByCatalogoIdAndOrden(
            UUID catalogoId,
            Integer orden
    ) {
        return springRepository.existsByCatalogo_IdAndOrden(catalogoId, orden);
    }

    @Override
    public boolean existsByCatalogoIdAndOrdenAndIdNot(
            UUID catalogoId,
            Integer orden,
            UUID id
    ) {
        return springRepository.existsByCatalogo_IdAndOrdenAndIdNot(
                catalogoId,
                orden,
                id
        );
    }
}
