package com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.inventarios.domain.model.InsumoAtributoValor;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.InsumoAtributoValorRepository;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.InsumoAtributoValorEntity;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.mapper.InsumoAtributoValorPersistenceMapper;
import com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.specification.SpringInsumoAtributoValorRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class InsumoAtributoValorRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        InsumoAtributoValor,
        InsumoAtributoValorEntity,
        UUID
        >
        implements InsumoAtributoValorRepository {

    private final SpringInsumoAtributoValorRepository springRepository;

    private final InsumoAtributoValorPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            InsumoAtributoValorEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected InsumoAtributoValorEntity toEntity(
            InsumoAtributoValor domain
    ) {
        return mapper.toEntity(domain);
    }

    @Override
    protected InsumoAtributoValor toDomain(
            InsumoAtributoValorEntity entity
    ) {
        return mapper.toDomain(entity);
    }

    @Override
    public Page<InsumoAtributoValor> findByInsumoId(
            UUID insumoId,
            Pageable pageable
    ) {
        return springRepository
                .findByInsumo_Id(insumoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsByInsumoIdAndTipoInsumoAtributoId(
            UUID insumoId,
            UUID tipoInsumoAtributoId
    ) {
        return springRepository.existsByInsumo_IdAndAtributo_Id(
                insumoId,
                tipoInsumoAtributoId
        );
    }

    @Override
    public boolean existsByInsumoIdAndTipoInsumoAtributoIdAndIdNot(
            UUID insumoId,
            UUID tipoInsumoAtributoId,
            UUID id
    ) {
        return springRepository.existsByInsumo_IdAndAtributo_IdAndIdNot(
                insumoId,
                tipoInsumoAtributoId,
                id
        );
    }
}
