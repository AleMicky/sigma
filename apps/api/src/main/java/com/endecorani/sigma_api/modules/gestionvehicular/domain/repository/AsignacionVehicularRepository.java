package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.AsignacionVehicular;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AsignacionVehicularRepository {

    Page<AsignacionVehicular> findAll(Pageable pageable);

    Page<AsignacionVehicular> searchWithFilters(
            String search,
            UUID solicitudVehicularId,
            UUID activoId,
            UUID conductorId,
            UUID asignadoPorId,
            Pageable pageable
    );

    Optional<AsignacionVehicular> findById(UUID id);

    List<AsignacionVehicular> findBySolicitudVehicularId(UUID solicitudVehicularId);

    List<AsignacionVehicular> findByActivoId(UUID activoId);

    List<AsignacionVehicular> findByConductorId(UUID conductorId);

    AsignacionVehicular save(AsignacionVehicular asignacionVehicular);

    void deleteById(UUID id);

    boolean existsBySolicitudVehicularId(UUID solicitudVehicularId);
}
