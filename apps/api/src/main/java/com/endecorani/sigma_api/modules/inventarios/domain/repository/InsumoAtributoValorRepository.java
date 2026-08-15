package com.endecorani.sigma_api.modules.inventarios.domain.repository;

import com.endecorani.sigma_api.modules.inventarios.domain.model.InsumoAtributoValor;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface InsumoAtributoValorRepository
        extends CrudRepository<InsumoAtributoValor, UUID> {

    Page<InsumoAtributoValor> findByInsumoId(
            UUID insumoId,
            Pageable pageable
    );

    boolean existsByInsumoIdAndTipoInsumoAtributoId(
            UUID insumoId,
            UUID tipoInsumoAtributoId
    );

    boolean existsByInsumoIdAndTipoInsumoAtributoIdAndIdNot(
            UUID insumoId,
            UUID tipoInsumoAtributoId,
            UUID id
    );
}
