package com.endecorani.sigma_api.modules.inventarios.domain.repository;

import com.endecorani.sigma_api.modules.inventarios.domain.model.TipoInsumoAtributo;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TipoInsumoAtributoRepository
        extends CrudRepository<TipoInsumoAtributo, UUID> {

    Page<TipoInsumoAtributo> findByTipoInsumoId(
            UUID tipoInsumoId,
            Pageable pageable
    );

    Page<TipoInsumoAtributo> searchByTipoInsumoId(
            UUID tipoInsumoId,
            String query,
            Pageable pageable
    );

    boolean existsByTipoInsumoIdAndCodigoIgnoreCase(
            UUID tipoInsumoId,
            String codigo
    );

    boolean existsByTipoInsumoIdAndCodigoIgnoreCaseAndIdNot(
            UUID tipoInsumoId,
            String codigo,
            UUID id
    );

    Integer findMaxOrdenByTipoInsumoId(UUID tipoInsumoId);

    boolean existsByTipoInsumoIdAndOrden(
            UUID tipoInsumoId,
            Integer orden
    );

    boolean existsByTipoInsumoIdAndOrdenAndIdNot(
            UUID tipoInsumoId,
            Integer orden,
            UUID id
    );
}
