package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehicular;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FlotaVehicularRepository {

    Page<FlotaVehicular> findAll(Pageable pageable);

    Page<FlotaVehicular> searchWithFilters(String search, Boolean activo, Pageable pageable);

    List<FlotaVehicular> findAllActivos();

    Optional<FlotaVehicular> findById(UUID id);

    Optional<FlotaVehicular> findByCodigo(String codigo);

    FlotaVehicular save(FlotaVehicular flotaVehicular);

    void deleteById(UUID id);

    boolean existsById(UUID id);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, UUID id);
}
