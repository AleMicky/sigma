package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributoValor;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.ActivoAtributoValorPersistenceMapper;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ActivoAtributoValorRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        ActivoAtributoValor,
        ActivoAtributoValorEntity,
        UUID
        >
        implements ActivoAtributoValorRepository {

    private final SpringActivoAtributoValorRepository springRepository;
    private final ActivoAtributoValorPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<ActivoAtributoValorEntity, UUID> jpaRepository() {
        return springRepository;
    }

    @Override
    protected ActivoAtributoValorEntity toEntity(ActivoAtributoValor domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected ActivoAtributoValor toDomain(ActivoAtributoValorEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public Page<ActivoAtributoValor> findByActivoId(
            UUID activoId,
            Pageable pageable
    ) {
        return springRepository
                .findByActivoId(activoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsByActivoIdAndActivoAtributoId(
            UUID activoId,
            UUID activoAtributoId
    ) {
        return springRepository.existsByActivoIdAndActivoAtributoId(
                activoId,
                activoAtributoId
        );
    }

    @Override
    public boolean existsByActivoIdAndActivoAtributoIdAndIdNot(
            UUID activoId,
            UUID activoAtributoId,
            UUID id
    ) {
        return springRepository.existsByActivoIdAndActivoAtributoIdAndIdNot(
                activoId,
                activoAtributoId,
                id
        );
    }
}
