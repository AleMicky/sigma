package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.TiposDocumento;
import com.endecorani.sigma_api.modules.activos.domain.repository.TiposDocumentoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TiposDocumentoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.TiposDocumentoPersistenceMapper;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class TiposDocumentoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        TiposDocumento,
        TiposDocumentoEntity,
        UUID
        >
        implements TiposDocumentoRepository {

    private final SpringTiposDocumentoRepository springRepository;

    private final TiposDocumentoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            TiposDocumentoEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected TiposDocumentoEntity toEntity(
            TiposDocumento domain
    ) {
        return mapper.toEntity(domain);
    }

    @Override
    protected TiposDocumento toDomain(
            TiposDocumentoEntity entity
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
    public Page<TiposDocumento> search(
            String query,
            Pageable pageable
    ) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}