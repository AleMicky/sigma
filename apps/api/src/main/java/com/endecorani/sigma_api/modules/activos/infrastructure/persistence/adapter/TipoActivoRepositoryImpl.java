package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivo;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TipoActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.TipoActivoPersistenceMapper;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringTipoActivoRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class TipoActivoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        TipoActivo,
        TipoActivoEntity,
        UUID
        >
        implements TipoActivoRepository {

    private final SpringTipoActivoRepository springRepository;

    private final TipoActivoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            TipoActivoEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected TipoActivoEntity toEntity(
            TipoActivo domain
    ) {
        return mapper.toEntity(domain);
    }

    @Override
    protected TipoActivo toDomain(
            TipoActivoEntity entity
    ) {
        return mapper.toDomain(entity);
    }

    @Override
    public boolean existsByNombreIgnoreCase(
            String nombre
    ) {
        return springRepository
                .existsByNombreIgnoreCase(nombre);
    }

    @Override
    public boolean existsByNombreIgnoreCaseAndIdNot(
            String nombre,
            UUID id
    ) {
        return springRepository
                .existsByNombreIgnoreCaseAndIdNot(
                        nombre,
                        id
                );
    }
}