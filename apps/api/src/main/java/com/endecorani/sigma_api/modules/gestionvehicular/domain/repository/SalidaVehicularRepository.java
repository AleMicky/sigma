package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicular;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SalidaVehicularRepository {

    Optional<SalidaVehicular> findById(UUID id);

    Optional<SalidaVehicular> findByNumero(String numero);

    Optional<SalidaVehicular> findByProcessInstanceId(String processInstanceId);

    Page<SalidaVehicular> searchWithFilters(
            String search,
            UUID activoId,
            UUID empleadoId,
            String estado,
            Instant fechaDesde,
            Instant fechaHasta,
            Pageable pageable
    );

    List<SalidaVehicular> findForReporte(
            String search,
            UUID activoId,
            UUID empleadoId,
            String estado,
            Instant fechaDesde,
            Instant fechaHasta
    );

    List<SalidaVehicular> findActivas();

    Page<SalidaVehicular> findByEmpleadoId(UUID empleadoId, Pageable pageable);

    List<SalidaVehicular> findByEmpleadoId(UUID empleadoId);

    List<SalidaVehicular> findByActivoId(UUID activoId);

    SalidaVehicular save(SalidaVehicular salidaVehicular);

    void deleteById(UUID id);

    boolean existsById(UUID id);
}
