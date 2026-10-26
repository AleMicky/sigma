package com.endecorani.sigma_api.modules.gestionvehicular.domain.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.BitacoraVehicular;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BitacoraVehicularRepository {

    List<BitacoraVehicular> findBySalidaVehicularId(UUID salidaVehicularId);

    Optional<BitacoraVehicular> findById(UUID id);

    Optional<BitacoraVehicular> findByIdAndSalidaVehicularId(UUID id, UUID salidaVehicularId);

    List<BitacoraVehicular> findConFiltros(
            UUID salidaVehicularId,
            UUID empleadoId,
            String tipo,
            Instant fechaDesde,
            Instant fechaHasta
    );

    BitacoraVehicular save(BitacoraVehicular bitacora);
}
