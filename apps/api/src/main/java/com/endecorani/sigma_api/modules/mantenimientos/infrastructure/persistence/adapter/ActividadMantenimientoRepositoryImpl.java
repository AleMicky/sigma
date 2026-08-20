package com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.entity.ActividadMantenimientoEntity;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.mapper.ActividadMantenimientoPersistenceMapper;
import com.endecorani.sigma_api.modules.mantenimientos.infrastructure.persistence.repository.SpringActividadMantenimientoRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ActividadMantenimientoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        ActividadMantenimiento,
        ActividadMantenimientoEntity,
        UUID
        >
        implements ActividadMantenimientoRepository {

    private final SpringActividadMantenimientoRepository springRepository;

    private final ActividadMantenimientoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            ActividadMantenimientoEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected ActividadMantenimientoEntity toEntity(
            ActividadMantenimiento domain
    ) {
        return mapper.toEntity(domain);
    }

    @Override
    protected ActividadMantenimiento toDomain(
            ActividadMantenimientoEntity entity
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
    public Page<ActividadMantenimiento> search(
            String query,
            Pageable pageable
    ) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}
