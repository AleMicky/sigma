package com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TipoActivoEstadoEntity;
import com.endecorani.sigma_api.shared.infrastructure.persistence.BaseJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringTipoActivoEstadoRepository
        extends BaseJpaRepository<TipoActivoEstadoEntity, UUID> {

    boolean existsByTipoActivoIdAndEstadoOperativoId(UUID tipoActivoId, UUID estadoOperativoId);

    boolean existsByTipoActivoIdAndEstadoOperativoIdAndIdNot(UUID tipoActivoId, UUID estadoOperativoId, UUID id);

    boolean existsByTipoActivoIdAndPredeterminadoTrue(UUID tipoActivoId);

    boolean existsByTipoActivoIdAndPredeterminadoTrueAndIdNot(UUID tipoActivoId, UUID id);

    Optional<TipoActivoEstadoEntity> findByTipoActivoIdAndPredeterminadoTrue(UUID tipoActivoId);

    Page<TipoActivoEstadoEntity> findByTipoActivoId(UUID tipoActivoId, Pageable pageable);

    Page<TipoActivoEstadoEntity> findByEstadoOperativoId(UUID estadoOperativoId, Pageable pageable);
}
