package com.endecorani.sigma_api.modules.inventarios.domain.repository;

import com.endecorani.sigma_api.modules.inventarios.domain.model.CategoriaInsumo;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CategoriaInsumoRepository extends CrudRepository<CategoriaInsumo, UUID> {

    boolean existsByTipoInsumoIdAndCodigoIgnoreCase(
            UUID tipoInsumoId,
            String codigo
    );

    boolean existsByTipoInsumoIdAndCodigoIgnoreCaseAndIdNot(
            UUID tipoInsumoId,
            String codigo,
            UUID id
    );

    Page<CategoriaInsumo> findByTipoInsumoId(
            UUID tipoInsumoId,
            Pageable pageable
    );

    Page<CategoriaInsumo> search(String query, Pageable pageable);

    Page<CategoriaInsumo> searchByTipoInsumoId(
            UUID tipoInsumoId,
            String query,
            Pageable pageable
    );
}
