package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributoValor;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ActivoAtributoValorRepository
        extends CrudRepository<ActivoAtributoValor, UUID> {

    Page<ActivoAtributoValor> findByActivoId(UUID activoId, Pageable pageable);

    List<ActivoAtributoValor> findByActivoId(UUID activoId);

    /** REQ-BIZ-004: borrado del conjunto previo dentro de la misma transacción del reemplazo. */
    void deleteAllByActivoId(UUID activoId);

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
