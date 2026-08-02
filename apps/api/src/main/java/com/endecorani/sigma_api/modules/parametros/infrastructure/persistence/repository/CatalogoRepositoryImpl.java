package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.parametros.domain.model.Catalogo;
import com.endecorani.sigma_api.modules.parametros.domain.repository.CatalogoRepository;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.CatalogoEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper.CatalogoPersistenceMapper;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CatalogoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Catalogo,
        CatalogoEntity,
        UUID
        >
        implements CatalogoRepository {

    private final SpringCatalogoRepository springRepository;

    private final CatalogoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            CatalogoEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected CatalogoEntity toEntity(Catalogo domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Catalogo toDomain(CatalogoEntity entity) {
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
    public Page<Catalogo> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}
