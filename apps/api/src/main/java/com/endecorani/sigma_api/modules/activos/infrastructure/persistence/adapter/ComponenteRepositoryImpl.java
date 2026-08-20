package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.Componente;
import com.endecorani.sigma_api.modules.activos.domain.repository.ComponenteRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ComponenteEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.ComponentePersistenceMapper;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ComponenteRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Componente,
        ComponenteEntity,
        UUID
        >
        implements ComponenteRepository {

    private final SpringComponenteRepository springRepository;

    private final ComponentePersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            ComponenteEntity,
            UUID
            > jpaRepository() {
        return springRepository;
    }

    @Override
    protected ComponenteEntity toEntity(Componente domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Componente toDomain(ComponenteEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public Page<Componente> findByTipoActivoId(
            UUID tipoActivoId,
            Pageable pageable
    ) {
        return springRepository
                .findByTipoActivoId(tipoActivoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Componente> searchByTipoActivoId(
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
}
