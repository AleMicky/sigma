package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoDocumento;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoDocumentoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoDocumentoSearchCriteria;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoDocumentoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.ActivoDocumentoPersistenceMapper;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.specification.ActivoDocumentoSpecifications;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ActivoDocumentoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<ActivoDocumento, ActivoDocumentoEntity, UUID>
        implements ActivoDocumentoRepository {

    private final SpringActivoDocumentoRepository springRepository;
    private final ActivoDocumentoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<ActivoDocumentoEntity, UUID> jpaRepository() {
        return springRepository;
    }

    @Override
    protected ActivoDocumentoEntity toEntity(ActivoDocumento domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected ActivoDocumento toDomain(ActivoDocumentoEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public Page<ActivoDocumento> findAll(ActivoDocumentoSearchCriteria criteria, Pageable pageable) {
        return springRepository
                .findAll(ActivoDocumentoSpecifications.withCriteria(criteria), pageable)
                .map(mapper::toDomain);
    }
}
