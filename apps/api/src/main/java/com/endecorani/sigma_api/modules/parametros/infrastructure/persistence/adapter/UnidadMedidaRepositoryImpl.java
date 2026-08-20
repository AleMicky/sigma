package com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.parametros.domain.model.UnidadMedida;
import com.endecorani.sigma_api.modules.parametros.domain.repository.UnidadMedidaRepository;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.UnidadMedidaEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.mapper.UnidadMedidaPersistenceMapper;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringUnidadMedidaRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UnidadMedidaRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        UnidadMedida,
        UnidadMedidaEntity,
        UUID
        >
        implements UnidadMedidaRepository {

    private final SpringUnidadMedidaRepository springRepository;

    private final UnidadMedidaPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            UnidadMedidaEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected UnidadMedidaEntity toEntity(UnidadMedida domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected UnidadMedida toDomain(UnidadMedidaEntity entity) {
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
    public Page<UnidadMedida> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}
