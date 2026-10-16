package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.adapter;

import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivoEstado;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoEstadoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TipoActivoEstadoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.mapper.TipoActivoEstadoPersistenceMapper;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringTipoActivoEstadoRepository;
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
public class TipoActivoEstadoRepositoryImpl
        extends AbstractJpaRepositoryAdapter<
        TipoActivoEstado,
        TipoActivoEstadoEntity,
        UUID
        >
        implements TipoActivoEstadoRepository {

    private final SpringTipoActivoEstadoRepository springRepository;
    private final TipoActivoEstadoPersistenceMapper mapper;

    @Override
    protected BaseJpaRepository<TipoActivoEstadoEntity, UUID> jpaRepository() {
        return springRepository;
    }

    @Override
    protected TipoActivoEstadoEntity toEntity(TipoActivoEstado domain) {
        return mapper.toEntity(domain);
    }

    @Override
    protected TipoActivoEstado toDomain(TipoActivoEstadoEntity entity) {
        return mapper.toDomain(entity);
    }

    @Override
    public boolean existsByTipoActivoIdAndEstadoOperativoId(UUID tipoActivoId, UUID estadoOperativoId) {
        return springRepository.existsByTipoActivoIdAndEstadoOperativoId(tipoActivoId, estadoOperativoId);
    }

    @Override
    public boolean existsByTipoActivoIdAndEstadoOperativoIdAndIdNot(UUID tipoActivoId, UUID estadoOperativoId, UUID id) {
        return springRepository.existsByTipoActivoIdAndEstadoOperativoIdAndIdNot(tipoActivoId, estadoOperativoId, id);
    }

    @Override
    public boolean existsByTipoActivoIdAndPredeterminadoTrue(UUID tipoActivoId) {
        return springRepository.existsByTipoActivoIdAndPredeterminadoTrue(tipoActivoId);
    }

    @Override
    public boolean existsByTipoActivoIdAndPredeterminadoTrueAndIdNot(UUID tipoActivoId, UUID id) {
        return springRepository.existsByTipoActivoIdAndPredeterminadoTrueAndIdNot(tipoActivoId, id);
    }

    @Override
    public Optional<TipoActivoEstado> findByTipoActivoIdAndPredeterminadoTrue(UUID tipoActivoId) {
        return springRepository.findByTipoActivoIdAndPredeterminadoTrue(tipoActivoId).map(mapper::toDomain);
    }

    @Override
    public Page<TipoActivoEstado> findByTipoActivoId(UUID tipoActivoId, Pageable pageable) {
        return springRepository.findByTipoActivoId(tipoActivoId, pageable).map(mapper::toDomain);
    }

    @Override
    public Page<TipoActivoEstado> findByEstadoOperativoId(UUID estadoOperativoId, Pageable pageable) {
        return springRepository.findByEstadoOperativoId(estadoOperativoId, pageable).map(mapper::toDomain);
    }
}
