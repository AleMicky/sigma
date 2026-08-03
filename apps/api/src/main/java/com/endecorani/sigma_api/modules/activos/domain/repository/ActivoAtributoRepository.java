package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributo;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ActivoAtributoRepository
        extends CrudRepository<ActivoAtributo, UUID> {

    Page<ActivoAtributo> findByTipoActivoId(
            UUID tipoActivoId,
            Pageable pageable
    );

    Page<ActivoAtributo> searchByTipoActivoId(
            UUID tipoActivoId,
            String query,
            Pageable pageable
    );

    boolean existsByTipoActivoIdAndCodigoIgnoreCase(
            UUID tipoActivoId,
            String codigo
    );

    boolean existsByTipoActivoIdAndCodigoIgnoreCaseAndIdNot(
            UUID tipoActivoId,
            String codigo,
            UUID id
    );

    Integer findMaxOrdenByTipoActivoId(UUID tipoActivoId);

    boolean existsByTipoActivoIdAndOrden(
            UUID tipoActivoId,
            Integer orden
    );

    boolean existsByTipoActivoIdAndOrdenAndIdNot(
            UUID tipoActivoId,
            Integer orden,
            UUID id
    );
}
