package com.endecorani.sigma_api.modules.parametros.domain.repository;

import com.endecorani.sigma_api.modules.parametros.domain.model.Gestion;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface GestionRepository extends CrudRepository<Gestion, UUID> {

    boolean existsByGestion(Integer gestion);

    boolean existsByGestionAndIdNot(
            Integer gestion,
            UUID id
    );

    Page<Gestion> findByGestion(
            Integer gestion,
            Pageable pageable
    );
}
