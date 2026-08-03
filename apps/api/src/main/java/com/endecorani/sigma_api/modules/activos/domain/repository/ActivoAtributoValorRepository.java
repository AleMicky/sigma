package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributoValor;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ActivoAtributoValorRepository
        extends CrudRepository<ActivoAtributoValor, UUID> {

    Page<ActivoAtributoValor> findByActivoId(UUID activoId, Pageable pageable);

    boolean existsByActivoIdAndActivoAtributoId(
            UUID activoId,
            UUID activoAtributoId
    );

    boolean existsByActivoIdAndActivoAtributoIdAndIdNot(
            UUID activoId,
            UUID activoAtributoId,
            UUID id
    );
}
