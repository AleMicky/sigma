package com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository;

import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.CargaCombustibleEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface SpringCargaCombustibleRepository extends JpaRepository<CargaCombustibleEntity, UUID> {

    List<CargaCombustibleEntity> findByActivoIdOrderByFechaCargaDesc(UUID activoId);

    /** REQ-VEH-019: consulta acotada por flota para el dashboard. */
    List<CargaCombustibleEntity> findByActivoIdIn(Collection<UUID> activoIds);

    List<CargaCombustibleEntity> findByViajeVehicularIdOrderByFechaCargaDesc(UUID viajeVehicularId);

    List<CargaCombustibleEntity> findBySalidaVehicularIdOrderByFechaCargaDesc(UUID salidaVehicularId);

    List<CargaCombustibleEntity> findBySalidaVehicularIdIn(Collection<UUID> salidaVehicularIds);

    List<CargaCombustibleEntity> findByFechaCargaBetweenOrderByFechaCargaAsc(
            LocalDateTime fechaDesde,
            LocalDateTime fechaHasta
    );

    List<CargaCombustibleEntity> findByInsumoIdOrderByFechaCargaDesc(UUID insumoId);

    List<CargaCombustibleEntity> findByEmpleadoIdOrderByFechaCargaDesc(UUID empleadoId);

    @Query("""
        SELECT c
        FROM CargaCombustibleEntity c
        LEFT JOIN com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity act ON c.activoId = act.id
        LEFT JOIN com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.InsumoEntity ins ON c.insumoId = ins.id
        WHERE (:activoId IS NULL OR c.activoId = :activoId)
          AND (:viajeVehicularId IS NULL OR c.viajeVehicularId = :viajeVehicularId)
          AND (:salidaVehicularId IS NULL OR c.salidaVehicularId = :salidaVehicularId)
          AND (:insumoId IS NULL OR c.insumoId = :insumoId)
          AND (:empleadoId IS NULL OR c.empleadoId = :empleadoId)
          AND (CAST(:fechaDesde AS java.time.LocalDateTime) IS NULL OR c.fechaCarga >= :fechaDesde)
          AND (CAST(:fechaHasta AS java.time.LocalDateTime) IS NULL OR c.fechaCarga <= :fechaHasta)
          AND (
            :search IS NULL
            OR LOWER(c.numeroFactura) LIKE :search
            OR LOWER(act.codigo) LIKE :search
            OR (act.codigoAlternativo IS NOT NULL AND LOWER(act.codigoAlternativo) LIKE :search)
            OR LOWER(act.nombre) LIKE :search
            OR LOWER(ins.codigo) LIKE :search
            OR LOWER(ins.nombre) LIKE :search
          )
        ORDER BY c.fechaCarga DESC
    """)
    Page<CargaCombustibleEntity> searchWithFilters(
            @Param("search") String search,
            @Param("activoId") UUID activoId,
            @Param("viajeVehicularId") UUID viajeVehicularId,
            @Param("salidaVehicularId") UUID salidaVehicularId,
            @Param("insumoId") UUID insumoId,
            @Param("empleadoId") UUID empleadoId,
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("fechaHasta") LocalDateTime fechaHasta,
            Pageable pageable
    );

    @Query("""
        SELECT c
        FROM CargaCombustibleEntity c
        LEFT JOIN com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity act ON c.activoId = act.id
        LEFT JOIN com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.InsumoEntity ins ON c.insumoId = ins.id
        WHERE (:activoId IS NULL OR c.activoId = :activoId)
          AND (:viajeVehicularId IS NULL OR c.viajeVehicularId = :viajeVehicularId)
          AND (:salidaVehicularId IS NULL OR c.salidaVehicularId = :salidaVehicularId)
          AND (:insumoId IS NULL OR c.insumoId = :insumoId)
          AND (:empleadoId IS NULL OR c.empleadoId = :empleadoId)
          AND (CAST(:fechaDesde AS java.time.LocalDateTime) IS NULL OR c.fechaCarga >= :fechaDesde)
          AND (CAST(:fechaHasta AS java.time.LocalDateTime) IS NULL OR c.fechaCarga <= :fechaHasta)
          AND (
            :search IS NULL
            OR LOWER(c.numeroFactura) LIKE :search
            OR LOWER(act.codigo) LIKE :search
            OR (act.codigoAlternativo IS NOT NULL AND LOWER(act.codigoAlternativo) LIKE :search)
            OR LOWER(act.nombre) LIKE :search
            OR LOWER(ins.codigo) LIKE :search
            OR LOWER(ins.nombre) LIKE :search
          )
        ORDER BY c.fechaCarga DESC
    """)
    List<CargaCombustibleEntity> findForExport(
            @Param("search") String search,
            @Param("activoId") UUID activoId,
            @Param("viajeVehicularId") UUID viajeVehicularId,
            @Param("salidaVehicularId") UUID salidaVehicularId,
            @Param("insumoId") UUID insumoId,
            @Param("empleadoId") UUID empleadoId,
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("fechaHasta") LocalDateTime fechaHasta
    );

    /** REQ-VEH-009: agregación en servidor con exactamente los mismos filtros que el listado. */
    @Query("""
        SELECT COUNT(c), SUM(c.litros), SUM(c.precioTotal)
        FROM CargaCombustibleEntity c
        LEFT JOIN com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity act ON c.activoId = act.id
        LEFT JOIN com.endecorani.sigma_api.modules.inventarios.infrastructure.persistence.entity.InsumoEntity ins ON c.insumoId = ins.id
        WHERE (:activoId IS NULL OR c.activoId = :activoId)
          AND (:viajeVehicularId IS NULL OR c.viajeVehicularId = :viajeVehicularId)
          AND (:salidaVehicularId IS NULL OR c.salidaVehicularId = :salidaVehicularId)
          AND (:insumoId IS NULL OR c.insumoId = :insumoId)
          AND (:empleadoId IS NULL OR c.empleadoId = :empleadoId)
          AND (CAST(:fechaDesde AS java.time.LocalDateTime) IS NULL OR c.fechaCarga >= :fechaDesde)
          AND (CAST(:fechaHasta AS java.time.LocalDateTime) IS NULL OR c.fechaCarga <= :fechaHasta)
          AND (
            :search IS NULL
            OR LOWER(c.numeroFactura) LIKE :search
            OR LOWER(act.codigo) LIKE :search
            OR (act.codigoAlternativo IS NOT NULL AND LOWER(act.codigoAlternativo) LIKE :search)
            OR LOWER(act.nombre) LIKE :search
            OR LOWER(ins.codigo) LIKE :search
            OR LOWER(ins.nombre) LIKE :search
          )
    """)
    Object[] resumenTotales(
            @Param("search") String search,
            @Param("activoId") UUID activoId,
            @Param("viajeVehicularId") UUID viajeVehicularId,
            @Param("salidaVehicularId") UUID salidaVehicularId,
            @Param("insumoId") UUID insumoId,
            @Param("empleadoId") UUID empleadoId,
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("fechaHasta") LocalDateTime fechaHasta
    );

    @Query("""
        SELECT c
        FROM CargaCombustibleEntity c
        WHERE c.activoId = :activoId
          AND c.fechaCarga >= :fechaDesde
          AND c.fechaCarga <= :fechaHasta
        ORDER BY c.fechaCarga ASC
    """)
    List<CargaCombustibleEntity> findByActivoIdAndFechaCargaBetween(
            @Param("activoId") UUID activoId,
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("fechaHasta") LocalDateTime fechaHasta
    );

    /**
     * REQ-VEH-019: tendencia mensual agregada en SQL, acotada por flota y fechas.
     * Devuelve [periodo, cantidadCargas, litros, costo].
     */
    @Query(value = """
        SELECT TO_CHAR(DATE_TRUNC('month', c.fecha_carga), 'YYYY-MM') AS periodo,
               COUNT(*) AS cantidad_cargas,
               COALESCE(SUM(c.litros), 0) AS litros,
               COALESCE(SUM(c.precio_total), 0) AS costo
        FROM gestion_vehicular.cargas_combustible c
        WHERE c.fecha_carga >= :desde
          AND c.fecha_carga <= :hasta
          AND c.activo_id IN (:activoIds)
        GROUP BY 1
        """, nativeQuery = true)
    List<Object[]> resumenMensualPorActivos(
            @Param("activoIds") Collection<UUID> activoIds,
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta
    );

    /** REQ-VEH-019: top 5 por costo en una sola consulta agrupada. */
    @Query(value = """
        SELECT c.activo_id,
               COUNT(*) AS cargas,
               COALESCE(SUM(c.litros), 0) AS litros,
               COALESCE(SUM(c.precio_total), 0) AS costo
        FROM gestion_vehicular.cargas_combustible c
        WHERE c.activo_id IN (:activoIds)
        GROUP BY c.activo_id
        ORDER BY costo DESC
        LIMIT 5
        """, nativeQuery = true)
    List<Object[]> topActivosPorCosto(@Param("activoIds") Collection<UUID> activoIds);
}
