package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ViajeVehicularEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringViajeVehicularRepository extends JpaRepository<ViajeVehicularEntity, UUID> {

    Optional<ViajeVehicularEntity> findByAsignacionVehicularId(UUID asignacionVehicularId);

    boolean existsByAsignacionVehicularId(UUID asignacionVehicularId);

    @Query("""
        SELECT v
        FROM ViajeVehicularEntity v
        JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity a ON v.asignacionVehicularId = a.id
        WHERE a.conductorId = :conductorId
    """)
    List<ViajeVehicularEntity> findByConductorId(@Param("conductorId") UUID conductorId);

    @Query("""
        SELECT v
        FROM ViajeVehicularEntity v
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity a ON v.asignacionVehicularId = a.id
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularEntity s ON a.solicitudVehicularId = s.id
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity c ON a.conductorId = c.id
        LEFT JOIN com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity act ON a.activoId = act.id
        WHERE (:search IS NULL
            OR LOWER(s.numero) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(act.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(act.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(c.numeroLicencia) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(v.observacion, '')) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:asignacionVehicularId IS NULL OR v.asignacionVehicularId = :asignacionVehicularId)
          AND (:conductorId IS NULL OR a.conductorId = :conductorId)
          AND (:estado IS NULL OR v.estado = :estado)
    """)
    Page<ViajeVehicularEntity> searchWithFilters(
            @Param("search") String search,
            @Param("asignacionVehicularId") UUID asignacionVehicularId,
            @Param("conductorId") UUID conductorId,
            @Param("estado") EstadoViajeVehicular estado,
            Pageable pageable
    );
}
