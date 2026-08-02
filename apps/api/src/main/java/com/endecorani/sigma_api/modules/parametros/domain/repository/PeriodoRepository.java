package com.endecorani.sigma_api.modules.parametros.domain.repository;

import com.endecorani.sigma_api.modules.parametros.domain.model.Periodo;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface PeriodoRepository extends CrudRepository<Periodo, UUID> {

    Page<Periodo> findByGestionId(
            UUID gestionId,
            Pageable pageable
    );

    List<Periodo> findAllByGestionId(UUID gestionId);

    List<Periodo> saveAll(List<Periodo> periodos);
}
