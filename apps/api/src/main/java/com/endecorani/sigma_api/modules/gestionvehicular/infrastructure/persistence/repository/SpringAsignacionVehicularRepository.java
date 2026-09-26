package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SpringAsignacionVehicularRepository extends JpaRepository<AsignacionVehicularEntity, UUID> {

    List<AsignacionVehicularEntity> findBySolicitudVehicularId(UUID solicitudVehicularId);

    List<AsignacionVehicularEntity> findByActivoId(UUID activoId);

    List<AsignacionVehicularEntity> findByConductorId(UUID conductorId);

    boolean existsBySolicitudVehicularId(UUID solicitudVehicularId);

    @Query("""
        SELECT a
        FROM AsignacionVehicularEntity a
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularEntity s ON a.solicitudVehicularId = s.id
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity c ON a.conductorId = c.id
        LEFT JOIN com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity act ON a.activoId = act.id
        LEFT JOIN com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity ve ON a.asignadoPorId = ve.empleadoId
        WHERE (:search IS NULL
            OR LOWER(s.numero) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(act.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(act.nombre) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(c.numeroLicencia) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(ve.nombreCompleto) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(a.observacion, '')) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:solicitudVehicularId IS NULL OR a.solicitudVehicularId = :solicitudVehicularId)
          AND (:activoId IS NULL OR a.activoId = :activoId)
          AND (:conductorId IS NULL OR a.conductorId = :conductorId)
          AND (:asignadoPorId IS NULL OR a.asignadoPorId = :asignadoPorId)
    """)
    Page<AsignacionVehicularEntity> searchWithFilters(
            @Param("search") String search,
            @Param("solicitudVehicularId") UUID solicitudVehicularId,
            @Param("activoId") UUID activoId,
            @Param("conductorId") UUID conductorId,
            @Param("asignadoPorId") UUID asignadoPorId,
            Pageable pageable
    );
}
