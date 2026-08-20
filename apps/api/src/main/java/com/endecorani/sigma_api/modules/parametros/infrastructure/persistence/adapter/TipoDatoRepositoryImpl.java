package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.parametros.domain.model.TipoDato;
import com.endecorani.sigma_api.modules.parametros.domain.repository.TipoDatoRepository;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.TipoDatoEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper.TipoDatoPersistenceMapper;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringTipoDatoRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class TipoDatoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        TipoDato,
        TipoDatoEntity,
        UUID
        >
        implements TipoDatoRepository {

    private final SpringTipoDatoRepository springRepository;

    private final TipoDatoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            TipoDatoEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected TipoDatoEntity toEntity(TipoDato domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected TipoDato toDomain(TipoDatoEntity entity) {
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
    public Page<TipoDato> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}
