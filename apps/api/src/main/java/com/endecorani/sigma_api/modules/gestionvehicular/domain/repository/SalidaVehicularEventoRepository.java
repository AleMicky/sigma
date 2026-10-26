package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SalidaVehicularEvento;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SalidaVehicularEventoRepository {

    List<SalidaVehicularEvento> findBySalidaVehicularId(UUID salidaVehicularId);

    Optional<SalidaVehicularEvento> findById(UUID id);

    Optional<SalidaVehicularEvento> findByIdAndSalidaVehicularId(UUID id, UUID salidaVehicularId);

    List<SalidaVehicularEvento> findBySalidaVehicularIdIn(List<UUID> salidaVehicularIds);

    SalidaVehicularEvento save(SalidaVehicularEvento evento);
}
