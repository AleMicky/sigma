package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.ActivoAtributoPersistenceMapper;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ActivoAtributoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        ActivoAtributo,
        ActivoAtributoEntity,
        UUID
        >
        implements ActivoAtributoRepository {

    private final SpringActivoAtributoRepository springRepository;

    private final ActivoAtributoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            ActivoAtributoEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected ActivoAtributoEntity toEntity(ActivoAtributo domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected ActivoAtributo toDomain(ActivoAtributoEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public Page<ActivoAtributo> findByTipoActivoId(
            UUID tipoActivoId,
            Pageable pageable
    ) {
        return springRepository
                .findByTipoActivoId(tipoActivoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<ActivoAtributo> searchByTipoActivoId(
            UUID tipoActivoId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByTipoActivoId(tipoActivoId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsByTipoActivoIdAndCodigoIgnoreCase(
            UUID tipoActivoId,
            String codigo
    ) {
        return springRepository.existsByTipoActivoIdAndCodigoIgnoreCase(
                tipoActivoId,
                codigo
        );
    }

    @Override
    public boolean existsByTipoActivoIdAndCodigoIgnoreCaseAndIdNot(
            UUID tipoActivoId,
            String codigo,
            UUID id
    ) {
        return springRepository.existsByTipoActivoIdAndCodigoIgnoreCaseAndIdNot(
                tipoActivoId,
                codigo,
                id
        );
    }

    @Override
    public Integer findMaxOrdenByTipoActivoId(UUID tipoActivoId) {
        return springRepository.findMaxOrdenByTipoActivoId(tipoActivoId);
    }

    @Override
    public boolean existsByTipoActivoIdAndOrden(
            UUID tipoActivoId,
            Integer orden
    ) {
        return springRepository.existsByTipoActivoIdAndOrden(
                tipoActivoId,
                orden
        );
    }

    @Override
    public boolean existsByTipoActivoIdAndOrdenAndIdNot(
            UUID tipoActivoId,
            Integer orden,
            UUID id
    ) {
        return springRepository.existsByTipoActivoIdAndOrdenAndIdNot(
                tipoActivoId,
                orden,
                id
        );
    }
}
