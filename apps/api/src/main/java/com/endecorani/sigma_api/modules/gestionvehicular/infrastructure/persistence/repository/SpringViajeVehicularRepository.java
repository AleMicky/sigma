package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoViajeVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ViajeVehicularEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SpringViajeVehicularRepository extends JpaRepository<ViajeVehicularEntity, UUID> {

    Optional<ViajeVehicularEntity> findByAsignacionVehicularId(UUID asignacionVehicularId);

    /** REQ-VEH-019: consulta acotada por las asignaciones de la flota. */
    List<ViajeVehicularEntity> findByAsignacionVehicularIdIn(Collection<UUID> asignacionVehicularIds);

    boolean existsByAsignacionVehicularId(UUID asignacionVehicularId);

    @Query("""
        SELECT v
        FROM ViajeVehicularEntity v
        JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity a ON v.asignacionVehicularId = a.id
        WHERE a.solicitudVehicularId = :solicitudVehicularId
    """)
    Optional<ViajeVehicularEntity> findBySolicitudVehicularId(@Param("solicitudVehicularId") UUID solicitudVehicularId);

    @Query("""
        SELECT v
        FROM ViajeVehicularEntity v
        JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity a ON v.asignacionVehicularId = a.id
        WHERE a.conductorId = :conductorId
        ORDER BY v.createdAt DESC
    """)
    List<ViajeVehicularEntity> findByConductorId(@Param("conductorId") UUID conductorId);

    @Query("""
        SELECT v
        FROM ViajeVehicularEntity v
        JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity a ON v.asignacionVehicularId = a.id
        WHERE a.activoId = :activoId
        ORDER BY v.createdAt DESC
    """)
    List<ViajeVehicularEntity> findByActivoId(@Param("activoId") UUID activoId);

    /** REQ-VEH-009: agregación en servidor con exactamente los mismos filtros que el listado. */
    @Query("""
        SELECT COUNT(v),
               SUM(CASE
                     WHEN v.kilometrajeSalida IS NOT NULL AND v.kilometrajeRetorno IS NOT NULL
                          AND v.kilometrajeRetorno >= v.kilometrajeSalida
                       THEN v.kilometrajeRetorno - v.kilometrajeSalida
                     ELSE 0
                   END)
        FROM ViajeVehicularEntity v
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity a ON v.asignacionVehicularId = a.id
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularEntity s ON a.solicitudVehicularId = s.id
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity c ON a.conductorId = c.id
        LEFT JOIN com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity act ON a.activoId = act.id
        WHERE (CAST(:search AS String) IS NULL
            OR LOWER(s.numero) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR LOWER(s.destino) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR LOWER(s.motivo) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR LOWER(act.codigo) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR (act.codigoAlternativo IS NOT NULL AND LOWER(act.codigoAlternativo) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')))
            OR LOWER(act.nombre) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR EXISTS (
                SELECT 1
                FROM com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity l
                WHERE l.conductorId = a.conductorId
                  AND LOWER(l.numeroLicencia) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            )
            OR LOWER(COALESCE(v.observacion, '')) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')))
          AND (:asignacionVehicularId IS NULL OR v.asignacionVehicularId = :asignacionVehicularId)
          AND (:solicitudVehicularId IS NULL OR a.solicitudVehicularId = :solicitudVehicularId)
          AND (:activoId IS NULL OR a.activoId = :activoId)
          AND (:conductorId IS NULL OR a.conductorId = :conductorId)
          AND (:estado IS NULL OR v.estado = :estado)
          AND (CAST(:fechaDesde AS java.time.LocalDateTime) IS NULL OR COALESCE(v.fechaSalidaReal, a.fechaAsignacion, s.fechaSalida) >= :fechaDesde)
          AND (CAST(:fechaHasta AS java.time.LocalDateTime) IS NULL OR COALESCE(v.fechaSalidaReal, a.fechaAsignacion, s.fechaSalida) <= :fechaHasta)
    """)
    Object[] resumenTotales(
            @Param("search") String search,
            @Param("asignacionVehicularId") UUID asignacionVehicularId,
            @Param("solicitudVehicularId") UUID solicitudVehicularId,
            @Param("activoId") UUID activoId,
            @Param("conductorId") UUID conductorId,
            @Param("estado") EstadoViajeVehicular estado,
            @Param("fechaDesde") java.time.LocalDateTime fechaDesde,
            @Param("fechaHasta") java.time.LocalDateTime fechaHasta
    );

    @Query("""
        SELECT v
        FROM ViajeVehicularEntity v
        JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity a ON v.asignacionVehicularId = a.id
        WHERE a.activoId = :activoId
        ORDER BY COALESCE(v.fechaRetornoReal, v.fechaSalidaReal, v.createdAt) DESC
        LIMIT 1
    """)
    Optional<ViajeVehicularEntity> findUltimoByActivoId(@Param("activoId") UUID activoId);

    @Query("""
        SELECT v
        FROM ViajeVehicularEntity v
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity a ON v.asignacionVehicularId = a.id
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularEntity s ON a.solicitudVehicularId = s.id
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity c ON a.conductorId = c.id
        LEFT JOIN com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity act ON a.activoId = act.id
        WHERE (CAST(:search AS String) IS NULL
            OR LOWER(s.numero) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR LOWER(s.destino) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR LOWER(s.motivo) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR LOWER(act.codigo) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR (act.codigoAlternativo IS NOT NULL AND LOWER(act.codigoAlternativo) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')))
            OR LOWER(act.nombre) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR EXISTS (
                SELECT 1 
                FROM com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity l
                WHERE l.conductorId = a.conductorId
                  AND LOWER(l.numeroLicencia) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            )
            OR LOWER(COALESCE(v.observacion, '')) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')))
          AND (:asignacionVehicularId IS NULL OR v.asignacionVehicularId = :asignacionVehicularId)
          AND (:solicitudVehicularId IS NULL OR a.solicitudVehicularId = :solicitudVehicularId)
          AND (:activoId IS NULL OR a.activoId = :activoId)
          AND (:conductorId IS NULL OR a.conductorId = :conductorId)
          AND (:estado IS NULL OR v.estado = :estado)
          AND (CAST(:fechaDesde AS java.time.LocalDateTime) IS NULL OR COALESCE(v.fechaSalidaReal, a.fechaAsignacion, s.fechaSalida) >= :fechaDesde)
          AND (CAST(:fechaHasta AS java.time.LocalDateTime) IS NULL OR COALESCE(v.fechaSalidaReal, a.fechaAsignacion, s.fechaSalida) <= :fechaHasta)
    """)
    Page<ViajeVehicularEntity> searchWithFilters(
            @Param("search") String search,
            @Param("asignacionVehicularId") UUID asignacionVehicularId,
            @Param("solicitudVehicularId") UUID solicitudVehicularId,
            @Param("activoId") UUID activoId,
            @Param("conductorId") UUID conductorId,
            @Param("estado") EstadoViajeVehicular estado,
            @Param("fechaDesde") java.time.LocalDateTime fechaDesde,
            @Param("fechaHasta") java.time.LocalDateTime fechaHasta,
            Pageable pageable
    );

    @Query("""
        SELECT v
        FROM ViajeVehicularEntity v
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity a ON v.asignacionVehicularId = a.id
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.SolicitudVehicularEntity s ON a.solicitudVehicularId = s.id
        LEFT JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorEntity c ON a.conductorId = c.id
        LEFT JOIN com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity act ON a.activoId = act.id
        WHERE (CAST(:search AS String) IS NULL
            OR LOWER(s.numero) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR LOWER(s.destino) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR LOWER(s.motivo) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR LOWER(act.codigo) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR (act.codigoAlternativo IS NOT NULL AND LOWER(act.codigoAlternativo) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')))
            OR LOWER(act.nombre) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            OR EXISTS (
                SELECT 1 
                FROM com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.ConductorLicenciaEntity l
                WHERE l.conductorId = a.conductorId
                  AND LOWER(l.numeroLicencia) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))
            )
            OR LOWER(COALESCE(v.observacion, '')) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%')))
          AND (:asignacionVehicularId IS NULL OR v.asignacionVehicularId = :asignacionVehicularId)
          AND (:solicitudVehicularId IS NULL OR a.solicitudVehicularId = :solicitudVehicularId)
          AND (:activoId IS NULL OR a.activoId = :activoId)
          AND (:conductorId IS NULL OR a.conductorId = :conductorId)
          AND (:estado IS NULL OR v.estado = :estado)
          AND (CAST(:fechaDesde AS java.time.LocalDateTime) IS NULL OR COALESCE(v.fechaSalidaReal, a.fechaAsignacion, s.fechaSalida) >= :fechaDesde)
          AND (CAST(:fechaHasta AS java.time.LocalDateTime) IS NULL OR COALESCE(v.fechaSalidaReal, a.fechaAsignacion, s.fechaSalida) <= :fechaHasta)
        ORDER BY COALESCE(v.fechaSalidaReal, a.fechaAsignacion, s.fechaSalida) DESC
    """)
    List<ViajeVehicularEntity> findHistorialForExport(
            @Param("search") String search,
            @Param("asignacionVehicularId") UUID asignacionVehicularId,
            @Param("solicitudVehicularId") UUID solicitudVehicularId,
            @Param("activoId") UUID activoId,
            @Param("conductorId") UUID conductorId,
            @Param("estado") EstadoViajeVehicular estado,
            @Param("fechaDesde") java.time.LocalDateTime fechaDesde,
            @Param("fechaHasta") java.time.LocalDateTime fechaHasta
    );

    @Query("""
        SELECT v
        FROM ViajeVehicularEntity v
        JOIN com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.AsignacionVehicularEntity a ON v.asignacionVehicularId = a.id
        WHERE (:activoId IS NULL OR a.activoId = :activoId)
          AND (:conductorId IS NULL OR a.conductorId = :conductorId)
          AND (
            (v.fechaSalidaReal IS NOT NULL AND v.fechaSalidaReal >= :fechaDesde AND v.fechaSalidaReal <= :fechaHasta)
            OR (v.fechaSalidaReal IS NULL AND a.fechaAsignacion >= :fechaDesde AND a.fechaAsignacion <= :fechaHasta)
          )
        ORDER BY COALESCE(v.fechaSalidaReal, a.fechaAsignacion) ASC
    """)
    List<ViajeVehicularEntity> findBitacoraViajes(
            @Param("activoId") UUID activoId,
            @Param("fechaDesde") java.time.LocalDateTime fechaDesde,
            @Param("fechaHasta") java.time.LocalDateTime fechaHasta,
            @Param("conductorId") UUID conductorId
    );

    /**
     * REQ-VEH-019: agregación única (COUNT/SUM/GROUP BY) de la tendencia mensual,
     * acotada por flota y rango de fechas. Devuelve una fila por periodo:
     * [periodo, totalViajes, completados, cancelados, enCurso, km].
     */
    @Query(value = """
        SELECT TO_CHAR(DATE_TRUNC('month', COALESCE(v.fecha_salida_real, a.fecha_asignacion, s.fecha_salida)), 'YYYY-MM') AS periodo,
               COUNT(*) AS total_viajes,
               COALESCE(SUM(CASE WHEN v.estado = 'FINALIZADO' THEN 1 ELSE 0 END), 0) AS completados,
               COALESCE(SUM(CASE WHEN v.estado = 'CANCELADO' THEN 1 ELSE 0 END), 0) AS cancelados,
               COALESCE(SUM(CASE WHEN v.estado = 'EN_CURSO' THEN 1 ELSE 0 END), 0) AS en_curso,
               COALESCE(SUM(CASE
                   WHEN v.kilometraje_retorno IS NOT NULL AND v.kilometraje_salida IS NOT NULL
                        AND v.kilometraje_retorno >= v.kilometraje_salida
                   THEN v.kilometraje_retorno - v.kilometraje_salida
                   ELSE 0 END), 0) AS km
        FROM gestion_vehicular.viajes_vehiculares v
        JOIN gestion_vehicular.asignaciones_vehiculares a ON a.id = v.asignacion_vehicular_id
        LEFT JOIN gestion_vehicular.solicitudes_vehiculares s ON s.id = a.solicitud_vehicular_id
        WHERE COALESCE(v.fecha_salida_real, a.fecha_asignacion, s.fecha_salida) >= :desde
          AND COALESCE(v.fecha_salida_real, a.fecha_asignacion, s.fecha_salida) <= :hasta
          AND a.activo_id IN (:activoIds)
        GROUP BY 1
        """, nativeQuery = true)
    List<Object[]> resumenMensualPorActivos(
            @Param("activoIds") Collection<UUID> activoIds,
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta
    );

    /** REQ-VEH-019: top 5 por km en una sola consulta agrupada. */
    @Query(value = """
        SELECT a.activo_id,
               COUNT(*) AS viajes,
               COALESCE(SUM(CASE
                   WHEN v.kilometraje_retorno IS NOT NULL AND v.kilometraje_salida IS NOT NULL
                        AND v.kilometraje_retorno >= v.kilometraje_salida
                   THEN v.kilometraje_retorno - v.kilometraje_salida
                   ELSE 0 END), 0) AS km
        FROM gestion_vehicular.viajes_vehiculares v
        JOIN gestion_vehicular.asignaciones_vehiculares a ON a.id = v.asignacion_vehicular_id
        WHERE a.activo_id IN (:activoIds)
        GROUP BY a.activo_id
        ORDER BY km DESC
        LIMIT 5
        """, nativeQuery = true)
    List<Object[]> topActivosPorKm(@Param("activoIds") Collection<UUID> activoIds);
}
