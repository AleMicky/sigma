package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.TipoActivoEstado;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface TipoActivoEstadoRepository extends CrudRepository<TipoActivoEstado, UUID> {

    boolean existsByTipoActivoIdAndEstadoOperativoId(UUID tipoActivoId, UUID estadoOperativoId);

    boolean existsByTipoActivoIdAndEstadoOperativoIdAndIdNot(UUID tipoActivoId, UUID estadoOperativoId, UUID id);

    boolean existsByTipoActivoIdAndPredeterminadoTrue(UUID tipoActivoId);

    boolean existsByTipoActivoIdAndPredeterminadoTrueAndIdNot(UUID tipoActivoId, UUID id);

    Optional<TipoActivoEstado> findByTipoActivoIdAndPredeterminadoTrue(UUID tipoActivoId);

    Page<TipoActivoEstado> findByTipoActivoId(UUID tipoActivoId, Pageable pageable);

    Page<TipoActivoEstado> findByEstadoOperativoId(UUID estadoOperativoId, Pageable pageable);
}
