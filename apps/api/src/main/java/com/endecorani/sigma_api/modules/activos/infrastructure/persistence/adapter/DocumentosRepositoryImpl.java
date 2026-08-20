package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.activos.domain.model.Documentos;
import com.endecorani.sigma_api.modules.activos.domain.repository.DocumentosRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.DocumentosSearchCriteria;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.DocumentosEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.DocumentosPersistenceMapper;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringDocumentosRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.specification.DocumentosSpecifications;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class DocumentosRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Documentos,
        DocumentosEntity,
        UUID
        >
        implements DocumentosRepository {

    private final SpringDocumentosRepository springRepository;

    private final DocumentosPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            DocumentosEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected DocumentosEntity toEntity(
            Documentos domain
    ) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Documentos toDomain(
            DocumentosEntity entity
    ) {
        return mapper.toDomain(entity);
    }

    @Override
    public Page<Documentos> findAll(
            DocumentosSearchCriteria criteria,
            Pageable pageable
    ) {
        return springRepository
                .findAll(DocumentosSpecifications.withCriteria(criteria), pageable)
                .map(mapper::toDomain);
    }
}
