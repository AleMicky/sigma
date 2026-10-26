package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SalidaVehicularEventoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringSalidaVehicularEventoRepository extends JpaRepository<SalidaVehicularEventoEntity, UUID> {

    List<SalidaVehicularEventoEntity> findBySalidaVehicularIdOrderByFechaHoraAsc(UUID salidaVehicularId);

    Optional<SalidaVehicularEventoEntity> findByIdAndSalidaVehicularId(UUID id, UUID salidaVehicularId);

    List<SalidaVehicularEventoEntity> findBySalidaVehicularIdInOrderByFechaHoraAsc(List<UUID> salidaVehicularIds);
}
