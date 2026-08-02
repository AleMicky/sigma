package com.endecorani.sigma_api.modules.parametros.domain.repository;

import com.endecorani.sigma_api.modules.parametros.domain.model.CatalogoItem;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CatalogoItemRepository extends CrudRepository<CatalogoItem, UUID> {

    Page<CatalogoItem> findByCatalogoId(
            UUID catalogoId,
            Pageable pageable
    );

    boolean existsByCatalogoIdAndValorIgnoreCase(
            UUID catalogoId,
            String valor
    );

    boolean existsByCatalogoIdAndValorIgnoreCaseAndIdNot(
            UUID catalogoId,
            String valor,
            UUID id
    );

    Integer findMaxOrdenByCatalogoId(UUID catalogoId);

    boolean existsByCatalogoIdAndOrden(
            UUID catalogoId,
            Integer orden
    );

    boolean existsByCatalogoIdAndOrdenAndIdNot(
            UUID catalogoId,
            Integer orden,
            UUID id
    );
}
