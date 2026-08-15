package com.endecorani.sigma_api.modules.inventarios.domain.repository;

import com.endecorani.sigma_api.modules.inventarios.domain.model.TipoInsumo;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TipoInsumoRepository extends CrudRepository<TipoInsumo, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    Page<TipoInsumo> search(String query, Pageable pageable);
}
