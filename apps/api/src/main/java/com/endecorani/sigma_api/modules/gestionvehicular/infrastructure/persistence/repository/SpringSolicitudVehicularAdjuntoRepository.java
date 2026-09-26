package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularAdjuntoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SpringSolicitudVehicularAdjuntoRepository extends JpaRepository<SolicitudVehicularAdjuntoEntity, UUID> {

    Page<SolicitudVehicularAdjuntoEntity> findBySolicitudVehicularId(UUID solicitudVehicularId, Pageable pageable);

    List<SolicitudVehicularAdjuntoEntity> findBySolicitudVehicularId(UUID solicitudVehicularId);

    List<SolicitudVehicularAdjuntoEntity> findBySolicitudVehicularIdIn(List<UUID> solicitudVehicularIds);

    void deleteBySolicitudVehicularId(UUID solicitudVehicularId);
}
