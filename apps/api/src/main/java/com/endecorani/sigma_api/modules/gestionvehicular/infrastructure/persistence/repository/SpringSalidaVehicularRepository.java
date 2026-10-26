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
            OR LOWER(s.motivo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.origen) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.destino) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:activoId IS NULL OR s.activoId = :activoId)
          AND (:empleadoId IS NULL OR s.empleadoId = :empleadoId)
          AND (:estado IS NULL OR :estado = '' OR UPPER(s.estado) = UPPER(:estado))
          AND (CAST(:fechaDesde AS java.time.Instant) IS NULL OR s.createdAt >= :fechaDesde)
          AND (CAST(:fechaHasta AS java.time.Instant) IS NULL OR s.createdAt <= :fechaHasta)
    """)
    Page<SalidaVehicularEntity> searchWithFilters(
            @Param("search") String search,
            @Param("activoId") UUID activoId,
            @Param("empleadoId") UUID empleadoId,
            @Param("estado") String estado,
            @Param("fechaDesde") Instant fechaDesde,
            @Param("fechaHasta") Instant fechaHasta,
            Pageable pageable
    );

    @Query("""
        SELECT s FROM SalidaVehicularEntity s
        WHERE (:search IS NULL OR :search = ''
            OR LOWER(s.numero) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.motivo) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.origen) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(s.destino) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:activoId IS NULL OR s.activoId = :activoId)
          AND (:empleadoId IS NULL OR s.empleadoId = :empleadoId)
          AND (:estado IS NULL OR :estado = '' OR UPPER(s.estado) = UPPER(:estado))
          AND (CAST(:fechaDesde AS java.time.Instant) IS NULL OR s.createdAt >= :fechaDesde)
          AND (CAST(:fechaHasta AS java.time.Instant) IS NULL OR s.createdAt <= :fechaHasta)
        ORDER BY s.createdAt DESC
    """)
    List<SalidaVehicularEntity> findForReporte(
            @Param("search") String search,
            @Param("activoId") UUID activoId,
            @Param("empleadoId") UUID empleadoId,
            @Param("estado") String estado,
            @Param("fechaDesde") Instant fechaDesde,
            @Param("fechaHasta") Instant fechaHasta
    );

    @Query("""
        SELECT s FROM SalidaVehicularEntity s
        WHERE UPPER(s.estado) NOT IN ('FINALIZADA', 'CANCELADA', 'FINALIZADO', 'CANCELADO')
        ORDER BY s.createdAt DESC
    """)
    List<SalidaVehicularEntity> findActivas();

    Page<SalidaVehicularEntity> findByEmpleadoIdOrderByCreatedAtDesc(UUID empleadoId, Pageable pageable);

    List<SalidaVehicularEntity> findByEmpleadoIdOrderByCreatedAtDesc(UUID empleadoId);

    List<SalidaVehicularEntity> findByActivoIdOrderByCreatedAtDesc(UUID activoId);
}
