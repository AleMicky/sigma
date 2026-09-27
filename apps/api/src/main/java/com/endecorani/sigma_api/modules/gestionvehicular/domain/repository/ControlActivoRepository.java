package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ControlActivo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ControlActivoRepository {

    Page<ControlActivo> findAll(Pageable pageable);

    Optional<ControlActivo> findById(UUID id);

    List<ControlActivo> findBySolicitudVehicularId(UUID solicitudVehicularId);

    List<ControlActivo> findByAsignacionVehicularId(UUID asignacionVehicularId);

    List<ControlActivo> findByActivoId(UUID activoId);

    ControlActivo save(ControlActivo controlActivo);

    void deleteById(UUID id);
}
