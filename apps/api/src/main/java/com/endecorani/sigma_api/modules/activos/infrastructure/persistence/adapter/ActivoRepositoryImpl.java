package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.ActivoPersistenceMapper;
import com.endecorani.sigma_api.shared.infrastructure.persistence.AbstractJpaRepositoryAdapter;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ActivoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<Activo, ActivoEntity, UUID>
        implements ActivoRepository {

    private final SpringActivoRepository springRepository;
    private final ActivoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<ActivoEntity, UUID> jpaRepository() {
        return springRepository;
    }

    @Override
    protected ActivoEntity toEntity(Activo domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected Activo toDomain(ActivoEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public Page<Activo> findByTipoActivoId(
            UUID tipoActivoId,
            Pageable pageable
    ) {
        return springRepository
                .findByTipoActivoId(tipoActivoId, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Activo> searchByTipoActivoId(
            UUID tipoActivoId,
            String query,
            Pageable pageable
    ) {
        return springRepository
                .searchByTipoActivoId(tipoActivoId, query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public Page<Activo> search(String query, Pageable pageable) {
        return springRepository
                .search(query, pageable)
                .map(mapper::toDomain);
    }

    @Override
    public boolean existsByCodigoIgnoreCase(String codigo) {
        return springRepository.existsByCodigoIgnoreCase(codigo);
    }

    @Override
    public boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id) {
        return springRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id);
    }
}
