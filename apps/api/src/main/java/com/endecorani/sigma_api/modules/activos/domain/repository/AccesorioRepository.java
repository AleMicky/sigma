package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.Accesorio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccesorioRepository {

    Accesorio save(Accesorio accesorio);

    Optional<Accesorio> findById(UUID id);

    List<Accesorio> findAll();

    Page<Accesorio> findAll(Pageable pageable);

    Page<Accesorio> findByCategoriaId(
            UUID categoriaId,
            Pageable pageable
    );

    boolean existsById(UUID id);

    void deleteById(UUID id);

    Page<Accesorio> search(
            String query,
            Pageable pageable
    );

    Page<Accesorio> searchByCategoriaId(
            UUID categoriaId,
            String query,
            Pageable pageable
    );

    boolean existsByCategoriaIdAndCodigoIgnoreCase(
            UUID categoriaId,
            String codigo
    );

    boolean existsByCategoriaIdAndCodigoIgnoreCaseAndIdNot(
            UUID categoriaId,
            String codigo,
            UUID id
    );
}
