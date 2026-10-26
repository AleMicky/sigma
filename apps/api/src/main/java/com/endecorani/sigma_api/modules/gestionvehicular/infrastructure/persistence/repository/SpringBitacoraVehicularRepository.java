package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.BitacoraVehicularEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringBitacoraVehicularRepository extends JpaRepository<BitacoraVehicularEntity, UUID> {

    List<BitacoraVehicularEntity> findBySalidaVehicularIdOrderByFechaHoraDesc(UUID salidaVehicularId);

    Optional<BitacoraVehicularEntity> findByIdAndSalidaVehicularId(UUID id, UUID salidaVehicularId);

    @Query("""
        SELECT b FROM BitacoraVehicularEntity b
        WHERE (:salidaVehicularId IS NULL OR b.salidaVehicularId = :salidaVehicularId)
          AND (:empleadoId IS NULL OR b.empleadoId = :empleadoId)
          AND (:tipo IS NULL OR :tipo = '' OR UPPER(b.tipo) = UPPER(:tipo))
          AND (CAST(:fechaDesde AS java.time.Instant) IS NULL OR b.fechaHora >= :fechaDesde)
          AND (CAST(:fechaHasta AS java.time.Instant) IS NULL OR b.fechaHora <= :fechaHasta)
        ORDER BY b.fechaHora DESC
    """)
    List<BitacoraVehicularEntity> findBitacorasConFiltros(
            @Param("salidaVehicularId") UUID salidaVehicularId,
            @Param("empleadoId") UUID empleadoId,
            @Param("tipo") String tipo,
            @Param("fechaDesde") Instant fechaDesde,
            @Param("fechaHasta") Instant fechaHasta
    );
}
