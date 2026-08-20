package com.endecorani.sigma_api.modules.parametros.domain.repository;

import com.endecorani.sigma_api.modules.parametros.domain.model.CatalogoItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.UUID;

public interface CatalogoItemRepository {

    CatalogoItem save(CatalogoItem entity);

    Optional<CatalogoItem> findById(UUID id);

    Page<CatalogoItem> findAll(Pageable pageable);

    boolean existsById(UUID id);

    void deleteById(UUID id);

    Page<CatalogoItem> findByCatalogoId(
            UUID catalogoId,
            Pageable pageable
    );

    Page<CatalogoItem> searchByCatalogoId(
            UUID catalogoId,
            String query,
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

    Page<CatalogoItem> findByCodigo(
            String codigo,
            Pageable pageable
    );

    Page<CatalogoItem> searchByCodigo(
            String codigo,
            String query,
            Pageable pageable
    );
}
