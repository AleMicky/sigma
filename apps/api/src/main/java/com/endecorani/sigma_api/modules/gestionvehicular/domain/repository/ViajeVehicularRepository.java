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

    default Page<ViajeVehicular> searchWithFilters(
            String search,
            UUID asignacionVehicularId,
            UUID solicitudVehicularId,
            UUID activoId,
            UUID conductorId,
            EstadoViajeVehicular estado,
            Pageable pageable
    ) {
        return searchWithFilters(search, asignacionVehicularId, solicitudVehicularId, activoId, conductorId, estado, null, null, pageable);
    }

    Page<ViajeVehicular> searchWithFilters(
            String search,
            UUID asignacionVehicularId,
            UUID solicitudVehicularId,
            UUID activoId,
            UUID conductorId,
            EstadoViajeVehicular estado,
            java.time.LocalDateTime fechaDesde,
            java.time.LocalDateTime fechaHasta,
            Pageable pageable
    );

    List<ViajeVehicular> findHistorialForExport(
            String search,
            UUID asignacionVehicularId,
            UUID solicitudVehicularId,
            UUID activoId,
            UUID conductorId,
            EstadoViajeVehicular estado,
            java.time.LocalDateTime fechaDesde,
            java.time.LocalDateTime fechaHasta
    );

    Optional<ViajeVehicular> findById(UUID id);

    Optional<ViajeVehicular> findByAsignacionVehicularId(UUID asignacionVehicularId);

    Optional<ViajeVehicular> findBySolicitudVehicularId(UUID solicitudVehicularId);

    List<ViajeVehicular> findByConductorId(UUID conductorId);

    List<ViajeVehicular> findByActivoId(UUID activoId);

    Optional<ViajeVehicular> findUltimoByActivoId(UUID activoId);

    ViajeVehicular save(ViajeVehicular viajeVehicular);

    void deleteById(UUID id);

    boolean existsById(UUID id);

    List<ViajeVehicular> findAllById(Iterable<UUID> ids);

    boolean existsByAsignacionVehicularId(UUID asignacionVehicularId);
}
