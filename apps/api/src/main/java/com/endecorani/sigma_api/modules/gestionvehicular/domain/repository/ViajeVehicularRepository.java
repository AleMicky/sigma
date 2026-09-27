package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ViajeVehicular;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ViajeVehicularRepository {

    Page<ViajeVehicular> findAll(Pageable pageable);

    Page<ViajeVehicular> searchWithFilters(
            String search,
            UUID asignacionVehicularId,
            UUID conductorId,
            EstadoViajeVehicular estado,
            Pageable pageable
    );

    Optional<ViajeVehicular> findById(UUID id);

    Optional<ViajeVehicular> findByAsignacionVehicularId(UUID asignacionVehicularId);

    List<ViajeVehicular> findByConductorId(UUID conductorId);

    ViajeVehicular save(ViajeVehicular viajeVehicular);

    void deleteById(UUID id);

    boolean existsByAsignacionVehicularId(UUID asignacionVehicularId);
}
