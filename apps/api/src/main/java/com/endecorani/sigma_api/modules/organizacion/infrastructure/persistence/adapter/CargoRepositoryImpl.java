package com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.organizacion.domain.model.Cargo;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.CargoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.CargoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.mapper.CargoPersistenceMapper;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class CargoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        Cargo,
        CargoEntity,
        UUID
        >
        implements CargoRepository {

    private final SpringCargoRepository springRepository;

    private final CargoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<
            CargoEntity,
            UUID
            > jpaRepository() {

        return springRepository;
    }

    @Override
    protected CargoEntity toEntity(Cargo domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Cargo toDomain(CargoEntity entity) {
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
    public Page<Cargo> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }
}