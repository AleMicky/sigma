package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.CargaCombustible;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CargaCombustibleRepository {

    Page<CargaCombustible> findAll(Pageable pageable);

    Page<CargaCombustible> searchWithFilters(
            String search,
            UUID activoId,
            UUID viajeVehicularId,
            UUID salidaVehicularId,
            UUID insumoId,
            UUID empleadoId,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta,
            Pageable pageable
    );

    List<CargaCombustible> findForExport(
            String search,
            UUID activoId,
            UUID viajeVehicularId,
            UUID salidaVehicularId,
            UUID insumoId,
            UUID empleadoId,
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta
    );

    Optional<CargaCombustible> findById(UUID id);

    List<CargaCombustible> findByActivoId(UUID activoId);

    List<CargaCombustible> findByViajeVehicularId(UUID viajeVehicularId);

    List<CargaCombustible> findBySalidaVehicularId(UUID salidaVehicularId);

    List<CargaCombustible> findAllById(Collection<UUID> ids);

    CargaCombustible save(CargaCombustible cargaCombustible);

    void deleteById(UUID id);

    boolean existsById(UUID id);
}
