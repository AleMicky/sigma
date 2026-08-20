package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.TipoMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.TipoMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.TipoMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.TipoMantenimientoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringTipoMantenimientoRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class TipoMantenimientoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        TipoMantenimiento,
        TipoMantenimientoEntity,
        UUID
        >
        implements TipoMantenimientoRepository {

    private final SpringTipoMantenimientoRepository springRepository;

    private final TipoMantenimientoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            TipoMantenimientoEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected TipoMantenimientoEntity toEntity(
            TipoMantenimiento domain
    ) {
        return mapper.toEntity(domain);
    }

    @Override
    protected TipoMantenimiento toDomain(
            TipoMantenimientoEntity entity
    ) {
        return mapper.toDomain(entity);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(
            String codigo
    ) {
        return springRepository
                .existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    ) {
        return springRepository
                .existsByCodigoIgnoreCaseAndIdNot(
                        codigo,
                        id
                );
    }

    @Override
    public Page<TipoMantenimiento> search(
            String query,
            Pageable pageable
    ) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}