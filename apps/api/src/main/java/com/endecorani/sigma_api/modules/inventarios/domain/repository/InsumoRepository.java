package com.endecorani.sigma_api.modules.inventarios.domain.repository;

import com.endecorani.sigma_api.modules.inventarios.domain.model.Insumo;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface InsumoRepository extends CrudRepository<Insumo, UUID> {

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(
            String codigo,
            UUID id
    );

    Page<Insumo> search(String query, Pageable pageable);
}
