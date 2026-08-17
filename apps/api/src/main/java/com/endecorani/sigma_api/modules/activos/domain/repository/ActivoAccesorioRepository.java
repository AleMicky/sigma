package com.endecorani.sigma_api.modules.activos.domain.repository;

import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAccesorio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActivoAccesorioRepository {

    ActivoAccesorio save(ActivoAccesorio activoAccesorio);

    Optional<ActivoAccesorio> findById(UUID id);

    List<ActivoAccesorio> findAll();

    Page<ActivoAccesorio> findAll(Pageable pageable);

    Page<ActivoAccesorio> findByActivoId(UUID activoId, Pageable pageable);

    Page<ActivoAccesorio> findByAccesorioId(UUID accesorioId, Pageable pageable);

    boolean existsById(UUID id);

    void deleteById(UUID id);

    Page<ActivoAccesorio> search(String query, Pageable pageable);

    Page<ActivoAccesorio> searchByActivoId(UUID activoId, String query, Pageable pageable);

    boolean existsByActivoIdAndAccesorioId(UUID activoId, UUID accesorioId);

    boolean existsByActivoIdAndAccesorioIdAndIdNot(UUID activoId, UUID accesorioId, UUID id);
}
