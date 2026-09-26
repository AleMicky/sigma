package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicularAdjunto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SolicitudVehicularAdjuntoRepository {

    Page<SolicitudVehicularAdjunto> findBySolicitudVehicularId(UUID solicitudVehicularId, Pageable pageable);

    List<SolicitudVehicularAdjunto> findBySolicitudVehicularId(UUID solicitudVehicularId);

    List<SolicitudVehicularAdjunto> findBySolicitudVehicularIdIn(List<UUID> solicitudVehicularIds);

    Optional<SolicitudVehicularAdjunto> findById(UUID id);

    SolicitudVehicularAdjunto save(SolicitudVehicularAdjunto adjunto);

    List<SolicitudVehicularAdjunto> saveAll(List<SolicitudVehicularAdjunto> adjuntos);

    void deleteById(UUID id);

    void deleteBySolicitudVehicularId(UUID solicitudVehicularId);
}
