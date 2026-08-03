package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.Documentos;
import com.endecorani.sigma_api.modules.activos.domain.repository.DocumentosRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.DocumentosEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.DocumentosPersistenceMapper;
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
    public Page<Documentos> findByActivoId(UUID activoId, Pageable pageable) {
        return springRepository
                .findByActivoId(activoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Documentos> findByTipoDocumentoId(UUID tipoDocumentoId, Pageable pageable) {
        return springRepository
                .findByTipoDocumentoId(tipoDocumentoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Documentos> findByActivoIdAndTipoDocumentoId(
            UUID activoId,
            UUID tipoDocumentoId,
            Pageable pageable
    ) {
        return springRepository
                .findByActivoIdAndTipoDocumentoId(activoId, tipoDocumentoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Documentos> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Documentos> searchByActivoId(
            UUID activoId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByActivoId(activoId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Documentos> searchByTipoDocumentoId(
            UUID tipoDocumentoId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByTipoDocumentoId(tipoDocumentoId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Documentos> searchByActivoIdAndTipoDocumentoId(
            UUID activoId,
            UUID tipoDocumentoId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByActivoIdAndTipoDocumentoId(
                        activoId,
                        tipoDocumentoId,
                        query,
                        pageable
                )
                .map(mapper::toDomain);
    }
}