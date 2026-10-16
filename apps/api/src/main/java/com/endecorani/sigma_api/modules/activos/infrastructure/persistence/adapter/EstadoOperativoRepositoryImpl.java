package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.activos.domain.model.EstadoOperativo;
import com.endecorani.sigma_api.modules.activos.domain.repository.EstadoOperativoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.EstadoOperativoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.EstadoOperativoPersistenceMapper;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringEstadoOperativoRepository;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class EstadoOperativoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        EstadoOperativo,
        EstadoOperativoEntity,
        UUID
        >
        implements EstadoOperativoRepository {

    private final SpringEstadoOperativoRepository springRepository;
    private final EstadoOperativoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<EstadoOperativoEntity, UUID> jpaRepository() {
        return springRepository;
    }

    @Override
    protected EstadoOperativoEntity toEntity(EstadoOperativo domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected EstadoOperativo toDomain(EstadoOperativoEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public Optional<EstadoOperativo> findByCodigoIgnoreCase(String codigo) {
        return springRepository.findByCodigoIgnoreCase(codigo).map(mapper::toDomain);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(String codigo) {
        return springRepository.existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id) {
        return springRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }

    @Override
    public boolean existsByNombreIgnoreCase(String nombre) {
        return springRepository.existsByNombreIgnoreCase(nombre);
    }

    @Override
    public boolean existsByNombreIgnoreCaseAndIdNot(String nombre, UUID id) {
        return springRepository.existsByNombreIgnoreCaseAndIdNot(nombre, id);
    }

    @Override
    public Page<EstadoOperativo> search(String query, Pageable pageable) {
        return springRepository.search(query, pageable).map(mapper::toDomain);
    }
}
