package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAsignacion;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAsignacionRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAsignacionSearchCriteria;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAsignacionEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.ActivoAsignacionPersistenceMapper;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.specification.ActivoAsignacionSpecifications;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ActivoAsignacionRepositoryImpl
        extends AbstractJpaRepositoryAdapter<ActivoAsignacion, ActivoAsignacionEntity, UUID>
        implements ActivoAsignacionRepository {

    private final SpringActivoAsignacionRepository springRepository;
    private final ActivoAsignacionPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<ActivoAsignacionEntity, UUID> jpaRepository() {
        return springRepository;
    }

    @Override
    protected ActivoAsignacionEntity toEntity(ActivoAsignacion domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected ActivoAsignacion toDomain(ActivoAsignacionEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public Page<ActivoAsignacion> findAll(ActivoAsignacionSearchCriteria criteria, Pageable pageable) {
        return springRepository
                .findAll(ActivoAsignacionSpecifications.withCriteria(criteria), pageable)
                .map(mapper::toDomain);
    }
}
