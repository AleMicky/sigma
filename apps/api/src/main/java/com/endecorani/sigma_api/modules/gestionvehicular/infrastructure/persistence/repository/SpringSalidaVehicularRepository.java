package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SalidaVehicularEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringSalidaVehicularRepository extends JpaRepository<SalidaVehicularEntity, UUID> {

    Optional<SalidaVehicularEntity> findByNumero(String numero);

    Optional<SalidaVehicularEntity> findByProcessInstanceId(String processInstanceId);

    @Query("""
        SELECT s FROM SalidaVehicularEntity s
        WHERE (:search IS NULL OR :search = ''
            OR LOWER(s.numero) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.descripcionActividad) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(s.observaciones, '')) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:activoId IS NULL OR s.activoId = :activoId)
          AND (:empleadoId IS NULL OR s.empleadoId = :empleadoId)
          AND (
              (:areaId IS NULL AND :createdById IS NULL)
              OR (:unirPorOr = true AND (
                  (:areaId IS NOT NULL AND s.empleadoId IN (
                      SELECT e.id FROM com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity e
                      WHERE e.areaId = :areaId
                  ))
                  OR (:createdById IS NOT NULL AND s.createdById = :createdById)
              ))
              OR (:unirPorOr = false AND (
                  (:areaId IS NULL OR s.empleadoId IN (
                      SELECT e.id FROM com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity e
                      WHERE e.areaId = :areaId
                  ))
                  AND (:createdById IS NULL OR s.createdById = :createdById)
              ))
          )
          AND (:estado IS NULL OR :estado = '' OR UPPER(s.estado) = UPPER(:estado))
          AND (CAST(:fechaDesde AS java.time.Instant) IS NULL OR COALESCE(s.fecha, s.createdAt) >= :fechaDesde)
          AND (CAST(:fechaHasta AS java.time.Instant) IS NULL OR COALESCE(s.fecha, s.createdAt) <= :fechaHasta)
    """)
    Page<SalidaVehicularEntity> searchWithFilters(
            @Param("search") String search,
            @Param("activoId") UUID activoId,
            @Param("empleadoId") UUID empleadoId,
            @Param("areaId") UUID areaId,
            @Param("createdById") UUID createdById,
            @Param("unirPorOr") boolean unirPorOr,
            @Param("estado") String estado,
            @Param("fechaDesde") Instant fechaDesde,
            @Param("fechaHasta") Instant fechaHasta,
            Pageable pageable
    );

    @Query("""
        SELECT s FROM SalidaVehicularEntity s
        WHERE (:search IS NULL OR :search = ''
            OR LOWER(s.numero) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.descripcionActividad) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(s.observaciones, '')) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:activoId IS NULL OR s.activoId = :activoId)
          AND (:empleadoId IS NULL OR s.empleadoId = :empleadoId)
          AND (
              (:areaId IS NULL AND :createdById IS NULL)
              OR (:unirPorOr = true AND (
                  (:areaId IS NOT NULL AND s.empleadoId IN (
                      SELECT e.id FROM com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity e
                      WHERE e.areaId = :areaId
                  ))
                  OR (:createdById IS NOT NULL AND s.createdById = :createdById)
              ))
              OR (:unirPorOr = false AND (
                  (:areaId IS NULL OR s.empleadoId IN (
                      SELECT e.id FROM com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity e
                      WHERE e.areaId = :areaId
                  ))
                  AND (:createdById IS NULL OR s.createdById = :createdById)
              ))
          )
          AND (:estado IS NULL OR :estado = '' OR UPPER(s.estado) = UPPER(:estado))
          AND (CAST(:fechaDesde AS java.time.Instant) IS NULL OR COALESCE(s.fecha, s.createdAt) >= :fechaDesde)
          AND (CAST(:fechaHasta AS java.time.Instant) IS NULL OR COALESCE(s.fecha, s.createdAt) <= :fechaHasta)
        ORDER BY COALESCE(s.fecha, s.createdAt) DESC
    """)
    List<SalidaVehicularEntity> findForReporte(
            @Param("search") String search,
            @Param("activoId") UUID activoId,
            @Param("empleadoId") UUID empleadoId,
            @Param("areaId") UUID areaId,
            @Param("createdById") UUID createdById,
            @Param("unirPorOr") boolean unirPorOr,
            @Param("estado") String estado,
            @Param("fechaDesde") Instant fechaDesde,
            @Param("fechaHasta") Instant fechaHasta
    );

    @Query("""
        SELECT s FROM SalidaVehicularEntity s
        WHERE UPPER(s.estado) NOT IN ('LLEGADA', 'FINALIZADA', 'CANCELADA', 'FINALIZADO', 'CANCELADO')
          AND (
              (:areaId IS NULL AND :createdById IS NULL)
              OR (:areaId IS NOT NULL AND s.empleadoId IN (
                  SELECT e.id FROM com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.EmpleadoEntity e
                  WHERE e.areaId = :areaId
              ))
              OR (:createdById IS NOT NULL AND s.createdById = :createdById)
          )
        ORDER BY COALESCE(s.fecha, s.createdAt) DESC
    """)
    List<SalidaVehicularEntity> findActivas(
            @Param("areaId") UUID areaId,
            @Param("createdById") UUID createdById
    );

    Page<SalidaVehicularEntity> findByEmpleadoIdOrderByCreatedAtDesc(UUID empleadoId, Pageable pageable);

    List<SalidaVehicularEntity> findByEmpleadoIdOrderByCreatedAtDesc(UUID empleadoId);

    List<SalidaVehicularEntity> findByActivoIdOrderByCreatedAtDesc(UUID activoId);
}
