package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoSearchCriteria;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper.EmpleadoPersistenceMapper;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.specification.EmpleadoSpecifications;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class EmpleadoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Empleado,
        EmpleadoEntity,
        UUID
        >
        implements EmpleadoRepository {

    private final SpringEmpleadoRepository springRepository;

    private final EmpleadoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            EmpleadoEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected EmpleadoEntity toEntity(Empleado domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Empleado toDomain(EmpleadoEntity entity) {
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
    public Page<Empleado> findAll(
            EmpleadoSearchCriteria criteria,
            Pageable pageable
    ) {
        return springRepository
                .findAll(EmpleadoSpecifications.withCriteria(criteria), pageable)
                .map(mapper::toDomain);
    }
}
