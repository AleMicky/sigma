package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.Componente;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ComponenteRepository
        extends CrudRepository<Componente, UUID> {

    Page<Componente> findByTipoActivoId(
            UUID tipoActivoId,
            Pageable pageable
    );

    Page<Componente> searchByTipoActivoId(
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
}
