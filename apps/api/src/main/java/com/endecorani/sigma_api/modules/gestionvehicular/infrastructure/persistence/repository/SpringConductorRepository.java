package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoConductor;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface SpringConductorRepository extends JpaRepository<ConductorEntity, UUID> {

    boolean existsByEmpleadoId(UUID empleadoId);

    boolean existsByEmpleadoIdAndIdNot(UUID empleadoId, UUID id);

    @Query("""
        SELECT DISTINCT c
        FROM ConductorEntity c
        LEFT JOIN com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity ve ON c.empleadoId = ve.empleadoId
        WHERE (:search IS NULL 
            OR LOWER(ve.codigo) LIKE LOWER(CONCAT('%', :search, '%')) 
            OR LOWER(ve.nombreCompleto) LIKE LOWER(CONCAT('%', :search, '%'))
            OR EXISTS (
                SELECT 1 
                FROM com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity cl
                WHERE cl.conductorId = c.id
                  AND (
                      LOWER(cl.numeroLicencia) LIKE LOWER(CONCAT('%', :search, '%'))
                      OR LOWER(cl.categoriaLicencia) LIKE LOWER(CONCAT('%', :search, '%'))
                  )
            ))
          AND (:categoria IS NULL OR EXISTS (
              SELECT 1 
              FROM com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity cl2
              WHERE cl2.conductorId = c.id AND cl2.categoriaLicencia = :categoria
          ))
          AND (:estado IS NULL OR c.estado = :estado)
          AND (:activo IS NULL OR c.activo = :activo)
    """)
    Page<ConductorEntity> searchWithFilters(
            @Param("search") String search,
            @Param("categoria") String categoria,
            @Param("estado") EstadoConductor estado,
            @Param("activo") Boolean activo,
            Pageable pageable
    );

    @Query("""
        SELECT DISTINCT c
        FROM ConductorEntity c
        LEFT JOIN com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity ve ON c.empleadoId = ve.empleadoId
        WHERE LOWER(ve.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
           OR LOWER(ve.nombreCompleto) LIKE LOWER(CONCAT('%', :search, '%'))
           OR EXISTS (
               SELECT 1 
               FROM com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity cl
               WHERE cl.conductorId = c.id
                 AND (
                     LOWER(cl.numeroLicencia) LIKE LOWER(CONCAT('%', :search, '%'))
                     OR LOWER(cl.categoriaLicencia) LIKE LOWER(CONCAT('%', :search, '%'))
                 )
           )
    """)
    Page<ConductorEntity> search(@Param("search") String search, Pageable pageable);

    @Query("""
        SELECT DISTINCT c
        FROM ConductorEntity c
        WHERE c.activo = true
          AND c.estado = com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoConductor.ACTIVO
          AND NOT EXISTS (
              SELECT 1
              FROM AsignacionVehicularEntity a
              JOIN SolicitudVehicularEntity s ON s.id = a.solicitudVehicularId
              WHERE a.conductorId = c.id
                AND s.fechaSalida < :fechaRetorno
                AND s.fechaRetornoEstimada > :fechaSalida
          )
    """)
    List<ConductorEntity> findDisponibles(
            @Param("fechaSalida") LocalDateTime fechaSalida,
            @Param("fechaRetorno") LocalDateTime fechaRetorno
    );
}
